import * as React from "react"
import {
    SharedLayoutTree,
    SharedLayoutProps,
    TransitionHandler,
    Presence,
    LayoutMetadata,
    StackQuery,
    StackPosition,
} from "./types"
import { Snapshot } from "../../motion/features/auto/types"
import { SharedLayoutContext } from "./SharedLayoutContext"
import { Auto } from "../../motion/features/auto/Auto"
import { batchTransitions } from "../../motion/features/auto/utils"
// import { Easing, circOut, linear } from "@popmotion/easing"
// import { progress } from "@popmotion/popcorn"
import { createCrossfadeAnimation, createSwitchAnimation } from "./animations"
import { motionValue } from "../../value"
import { Easing, circOut, linear } from "@popmotion/easing"
import { progress, mix } from "@popmotion/popcorn"

interface Crossfade {
    fadingIn: Auto | undefined
    fadingOut: Auto | undefined
}

type LayoutStack = Auto[]
type LayoutStacks = Map<string, LayoutStack>

const defaultMagicTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

/**
 * Every render we analyse each child and create a map of data about the
 * following shared layout transition
 */
const metadata = new WeakMap<Auto, LayoutMetadata>()

function getMetadata(child: Auto): LayoutMetadata {
    return (metadata.get(child) as LayoutMetadata) || { isVisible: true }
}

function setMetadata(child: Auto, newData: Partial<LayoutMetadata>) {
    const data = getMetadata(child)
    metadata.set(child, { ...data, ...newData })
}

/**
 * @public
 */
export class AnimateSharedLayout extends React.Component<
    SharedLayoutProps,
    SharedLayoutTree
> {
    /**
     * Keep track of all animate children.
     */
    private children = new Set<Auto>()

    /**
     * As animate components with a defined `layoutId` are added/removed to the tree,
     * we store them in order. When one is added, it will animate out from the
     * previous one, and when it's removed, it'll animate to the previous one.
     */
    private stacks: LayoutStacks = new Map()

    /**
     * Keep track of the depth of the most shallow animate child
     * so we can identify root animate children.
     */
    private rootDepth: number

    /**
     * This flag determines whether we re-run snapshots and run animate transitions.
     */
    private shouldTransition: boolean

    /**
     * Create an instance of the update batcher so we can run snapshots across
     * components and fire animate transitions in the correct order.
     */
    private batch = batchTransitions()

    /**
     * We're tracking mount status as only subsequently-entering components need
     * tagging with `shouldResumeFromPrevious`.
     */
    private hasMounted = false

    /**
     * Keep one snapshot for each stack in the event the all layoutId children
     * are removed from a stack before the new one is added.
     */
    private snapshots = new Map<string, Snapshot>()

    state = {
        /**
         * Allow children, like AnimatePresence, to force-render this component
         * to ensure animate children correctly identify parallel state changes that
         * might affect their layout.
         */
        forceRender: (): void => this.setState({ ...this.state }),

        register: (child: Auto) => this.addChild(child),
    }

    componentDidMount() {
        this.hasMounted = true
    }

    /**
     * We always want the component to re-render but for performance reasons we might
     * want to control whether we take snapshots and perform animate transitions.
     */
    shouldComponentUpdate(
        nextProps: SharedLayoutProps,
        nextState: SharedLayoutTree
    ) {
        this.shouldTransition = false

        if (this.state !== nextState) {
            // This should always be true if we've got a new state as a result of a forced render
            this.shouldTransition = true
        } else {
            // If we don't have a defined dependency, or we do and it's changed,
            // we want to transition
            const { dependency } = this.props
            const hasDependency = !!(dependency ?? nextProps.dependency)
            const hasChanged = dependency !== nextProps.dependency

            this.shouldTransition =
                !hasDependency || (hasDependency && hasChanged)
        }

        /**
         * Reset rotation on all children so we can properly measure the correct bounding box.
         * The supportRotate prop isn't public API so this should only run in Framer.
         *
         * Ideally this would run in getSnapshotBeforeUpdate as shouldComponentUpdate may run
         * multiple times in concurrent mode, but currently this is introducing bugs.
         */
        if (this.shouldTransition) {
            const { supportRotate } = this.props
            supportRotate &&
                this.children.forEach(child => child.resetRotation())
        }

        return true
    }

    /**
     * Loop through all children and update their latest origin snapshots.
     */
    getSnapshotBeforeUpdate() {
        if (!this.shouldTransition) return null

        /**
         * Snapshot the visual origin of every child.
         */
        this.children.forEach(child => child.snapshotOrigin())

        /**
         * Every child keeps a local snapshot, but we also want to record
         * snapshots of the visible children as, if they're are being removed
         * in this render, we can still access them.
         */
        this.stacks.forEach((stack, key) => {
            const latestChild = stack[stack.length - 1]
            latestChild && this.snapshots.set(key, latestChild.measuredOrigin)
        })

        return null
    }

    /**
     * Once all children have updated, snapshot their target snapshots and run
     * animate transitions.
     */
    componentDidUpdate() {
        // TODO: This would currently prevent animate children from working
        this.shouldTransition && this.startAnimation()
    }

    /**
     * Register a new `Magic` child
     */
    addChild(child: Auto) {
        this.setRootDepth(child)
        this.children.add(child)

        setMetadata(child, {
            depth: child.depth,
            layoutId: child.props.layoutId,
            presence: this.hasMounted ? Presence.Entering : Presence.Present,
            position: StackPosition.Lead,
            prevPosition: StackPosition.Lead,
        })

        this.addChildToStack(child)

        return () => this.removeChild(child)
    }

    addChildToStack(child: Auto) {
        const { layoutId } = child.props
        if (layoutId === undefined) return

        const stack = this.getStack(layoutId)

        stack.forEach(stackChild => {
            const { position } = getMetadata(stackChild)
            const isLead = position === StackPosition.Lead
            setMetadata(stackChild, {
                position: isLead ? StackPosition.Previous : undefined,
                prevPosition: isLead ? StackPosition.Lead : undefined,
            })
        })

        stack.push(child)
    }

    removeChild(child: Auto) {
        this.children.delete(child)
        this.removeChildFromStack(child)
    }

    removeChildFromStack(child: Auto) {
        const { layoutId } = child.props
        if (layoutId === undefined) return

        const stack = this.getStack(layoutId)
        const childIndex = stack.findIndex(stackChild => child === stackChild)
        if (childIndex === -1) return

        stack.splice(childIndex, 1)

        // Set the previous child to visible
        const previousChild = getPreviousChild(stack, stack.length)

        if (previousChild) {
            setMetadata(previousChild, {
                position: StackPosition.Lead,
                prevPosition: StackPosition.Previous,
            })
        }
    }

    /**
     * Return a stack of animate children based on the provided layoutId.
     * Will create a stack if none currently exists with that layoutId.
     */
    getStack(id: string): LayoutStack {
        !this.stacks.has(id) && this.stacks.set(id, [])

        return this.stacks.get(id) as LayoutStack
    }

    /**
     * The root depth is the shallowest `depth` of all our children.
     * Children with the shallowest depth get used to crossfade between trees.
     */
    setRootDepth(child: Auto) {
        if (this.rootDepth === undefined) {
            this.rootDepth = child.depth
        } else {
            this.rootDepth = Math.min(child.depth, this.rootDepth)
        }
    }

    startAnimation() {
        const { type, transition = defaultMagicTransition } = this.props
        const options = { type, transition }

        const createAnimation =
            type === "crossfade"
                ? createCrossfadeAnimation
                : createSwitchAnimation

        this.children.forEach(child => this.updateMetadata(child))
        const stackMetadata = this.getStackQuery()

        const handler: TransitionHandler = {
            snapshotTarget: child => {
                const { layoutId, presence } = getMetadata(child)

                if (
                    // If this component has an animate prop
                    isAutoAnimate(child) ||
                    // If this component is either entering or present
                    presence !== Presence.Exiting ||
                    // If the lead component in the stack is present, snapshot
                    // TODO: Figure out what this breaks if removed
                    stackMetadata.isLeadPresent(layoutId)
                ) {
                    child.snapshotTarget()
                }
            },
            startAnimation: child => {
                const config = createAnimation(
                    getMetadata(child),
                    stackMetadata
                )

                child.startAnimation({ ...options, ...config })
                this.resetMetadata(child)
            },
        }
        /**
         * Shared layout animations can be used without the AnimateSharedLayout wrapping component.
         * This requires some co-ordination across components to stop layout thrashing
         * and ensure measurements are taken at the correct time.
         *
         * Here we use that same mechanism of schedule/flush.
         */
        this.children.forEach(child => this.batch.add(child))
        this.batch.flush(handler)
        this.snapshots.clear()
    }

    getStackQuery(): StackQuery {
        const leadComponents = new Map<string, Auto>()
        const previousComponents = new Map<string, Auto>()

        this.stacks.forEach((stack, key) => {
            const leadIndex = stack.findIndex(
                child => getMetadata(child).position === StackPosition.Lead
            )
            if (leadIndex === -1) return

            leadComponents.set(key, stack[leadIndex])
            const previous = getPreviousChild(stack, leadIndex)
            previous && previousComponents.set(key, previous)
        })

        return {
            isLeadPresent: queryStack(
                lead => lead && getMetadata(lead).presence !== Presence.Exiting,
                leadComponents
            ),
            getPreviousOrigin: queryStack(
                (previous, id) =>
                    previous ? previous.measuredOrigin : this.snapshots.get(id),
                previousComponents
            ),
            getPreviousTarget: queryStack(
                previous => previous && previous.measuredTarget,
                previousComponents
            ),
            getLeadOrigin: queryStack(
                lead => lead?.measuredOrigin,
                leadComponents
            ),
            getLeadTarget: queryStack(
                lead => lead?.measuredTarget,
                leadComponents
            ),
            getLead: queryStack(
                lead => lead && getMetadata(lead),
                leadComponents
            ),
            isRootDepth: depth => depth === this.rootDepth,
            getCrossfadeIn: () => (origin: number, target: number, p: number) =>
                mix(0, target, crossfadeIn(p)),
            getCrossfadeOut: () => (
                origin: number,
                _target: number,
                p: number
            ) => mix(origin, 0, crossfadeOut(p)),
        }
    }

    updateMetadata(child: Auto) {
        const { presence } = getMetadata(child)

        if (!child.isPresent()) {
            setMetadata(child, { presence: Presence.Exiting })
        } else if (presence !== Presence.Entering) {
            setMetadata(child, { presence: Presence.Present })
        }
    }

    /**
     * Reset the metadata
     */
    resetMetadata(child: Auto) {
        const { presence } = getMetadata(child)
        const newData: Partial<LayoutMetadata> = {}

        // If the component was entering it can be considered entered now
        if (presence === Presence.Entering) {
            newData.presence = Presence.Present
        }

        // If on this render the component is the lead, set to was lead for the next frame
        // if (isLead) {
        //     newData.wasLead = true
        // }

        setMetadata(child, newData)
    }

    render() {
        return (
            <SharedLayoutContext.Provider value={this.state}>
                {this.props.children}
            </SharedLayoutContext.Provider>
        )
    }
}

function queryStack<T>(
    callback: (child: Auto | undefined, id: string) => T,
    components: Map<string, Auto>
) {
    return (id: string | undefined) => {
        if (id === undefined) return

        const child = components.get(id)
        return callback(child, id)
    }
}

function getPreviousChild(stack: LayoutStack, index: number) {
    for (let i = index - 1; i >= 0; i--) {
        const child = stack[i]
        if (child.isPresent()) {
            return child
        }
    }

    // If we only have two children, always return the first one
    // even if it isn't present
    if (stack.length === 2) return stack[0]
}

function opacity(snapshot?: Snapshot, value: number = 1) {
    if (!snapshot) return
    return {
        ...snapshot,
        style: {
            ...snapshot.style,
            opacity: value,
        },
    }
}

function isAutoAnimate(child: Auto) {
    return child.props.animate === true
}

function compress(min: number, max: number, easing: Easing): Easing {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(progress(min, max, p))
    }
}

const crossfadeIn = compress(0, 0.5, circOut)
const crossfadeOut = compress(0.5, 0.95, linear)
