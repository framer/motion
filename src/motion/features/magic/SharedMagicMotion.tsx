import * as React from "react"
import {
    SharedMagicTree,
    Snapshot,
    SharedMagicMotionProps,
    TransitionHandler,
    MagicAnimationConfig,
} from "./types"
import { MagicContext } from "./MagicContext"
import { Magic } from "./Magic"
import { batchTransitions } from "./utils"
import { Easing, circOut, linear } from "@popmotion/easing"
import { progress } from "@popmotion/popcorn"

type MagicStack = Magic[]
type MagicStacks = Map<string, MagicStack>

const defaultMagicTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

/**
 * @public
 */
export class SharedMagicMotion extends React.Component<
    SharedMagicMotionProps,
    SharedMagicTree
> {
    /**
     * Keep track of all magic children.
     */
    private children = new Set<Magic>()

    /**
     * As magic components with a defined `sharedId` are added/removed to the tree,
     * we store them in order. When one is added, it will animate out from the
     * previous one, and when it's removed, it'll animate to the previous one.
     */
    private stacks: MagicStacks = new Map()

    /**
     * Keep track of the depth of the most shallow magic child
     * so we can identify root magic children.
     */
    private rootDepth: number

    /**
     * This flag determines whether we re-run snapshots and run magic transitions.
     */
    private shouldTransition: boolean

    /**
     * Create an instance of the update batcher so we can run snapshots across
     * components and fire magic transitions in the correct order.
     */
    private batch = batchTransitions()

    /**
     * Keep one snapshot for each stack in the event the all sharedId children
     * are removed from a stack before the new one is added.
     */
    private snapshots = new Map<string, Snapshot>()

    /**
     * We're tracking mount status as only subsequently-entering components need
     * tagging with `shouldResumeFromPrevious`.
     */
    private hasMounted = false

    state = {
        /**
         * Allow children, like AnimatePresence, to force-render this component
         * to ensure magic children correctly identify parallel state changes that
         * might affect their layout.
         */
        forceRender: (): void => this.setState({ ...this.state }),

        register: (child: Magic) => this.addChild(child),
    }

    componentDidMount() {
        this.hasMounted = true
    }

    /**
     * We always want the component to re-render but for performance reasons we might
     * want to control whether we take snapshots and perform magic transitions.
     */
    shouldComponentUpdate(
        nextProps: SharedMagicMotionProps,
        nextState: SharedMagicTree
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
         * Hijacking this lifecycle method to reset rotation on any children so we
         * can properly measure the current bounding box. This isn't publicly supported as
         * this is naughty, but `rotate` is quite visible in Framer and needs some kind
         * of support.
         *
         * Although this might run multiple times in concurrent mode, this is
         * a write operation and getSnapshotBeforeUpdate is a read operation. So doing
         * it here avoids layout thrashing.
         */
        const { supportRotate } = this.props
        if (supportRotate && this.shouldTransition) {
            this.children.forEach(child => child.resetRotation())
        }

        return true
    }

    /**
     * Loop through all children and update their latest origin snapshots.
     */
    getSnapshotBeforeUpdate() {
        if (!this.shouldTransition) return null

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
     * magic transitions.
     */
    componentDidUpdate() {
        if (!this.shouldTransition) return

        /**
         * Magic animations can be used without the SharedMagicMotion wrapping component.
         * This requires some co-ordination across components to stop layout thrashing
         * and ensure measurements are taken at the correct time.
         *
         * Here we use that same mechanism of schedule/flush.
         */
        this.children.forEach(child => this.batch.add(child))
        const { crossfade, transition = defaultMagicTransition } = this.props
        const options = { crossfade, transition }
        const handler = controlledHandler(
            options,
            this.rootDepth,
            this.stacks,
            this.snapshots
        )
        this.batch.flush(handler)
        this.snapshots.clear()
    }

    /**
     * Register a new `Magic` child
     */
    addChild(child: Magic) {
        this.setRootDepth(child)
        this.children.add(child)
        this.addChildToStack(child)
        if (this.hasMounted) child.shouldResumeFromPrevious = true
        return () => this.removeChild(child)
    }

    addChildToStack(child: Magic) {
        const { sharedId } = child.props
        if (sharedId === undefined) return

        const stack = this.getStack(sharedId)
        stack.push(child)

        const stackLength = stack.length
        const previousChild = stack[stackLength - 2]
        previousChild && previousChild.hide()
    }

    removeChild(child: Magic) {
        this.children.delete(child)
        this.removeChildFromStack(child)
    }

    removeChildFromStack(child: Magic) {
        const { sharedId } = child.props
        if (sharedId === undefined) return

        const stack = this.getStack(sharedId)
        const childIndex = stack.findIndex(stackChild => child === stackChild)
        if (childIndex === -1) return

        stack.splice(childIndex, 1)

        // Set the previous child to visible
        const previousChild = stack[childIndex - 1]
        previousChild && previousChild.show()
    }

    /**
     * Return a stack of magic children based on the provided sharedId.
     * Will create a stack if none currently exists with that sharedId.
     */
    getStack(id: string): MagicStack {
        !this.stacks.has(id) && this.stacks.set(id, [])

        return this.stacks.get(id) as MagicStack
    }

    setRootDepth(child: Magic) {
        this.rootDepth =
            this.rootDepth === undefined
                ? child.depth
                : Math.min(child.depth, this.rootDepth)
    }

    render() {
        return (
            <MagicContext.Provider value={this.state}>
                {this.props.children}
            </MagicContext.Provider>
        )
    }
}

function stackQuery<T, F>(
    callback: (sharedId: string, child: Magic) => T | F,
    fallback?: F
) {
    return (child: Magic) => {
        const { sharedId } = child.props
        return sharedId === undefined ? fallback : callback(sharedId, child)
    }
}

function compress(min: number, max: number, easing: Easing): Easing {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(progress(min, max, p))
    }
}

function controlledHandler(
    { transition, crossfade }: MagicAnimationConfig,
    rootDepth: number,
    stacks: MagicStacks,
    snapshots: Map<string, Snapshot>
): TransitionHandler {
    const visible = new Map<string, Magic>()
    const previous = new Map<string, Magic>()

    stacks.forEach((stack, key) => {
        const visibleIndex = stack.findIndex(child => child.isVisible)
        if (visibleIndex === -1) return

        visible.set(key, stack[visibleIndex])
        const previousIndex = visibleIndex - 1
        if (previousIndex === -1) return

        previous.set(key, stack[previousIndex])
    })

    const isVisibleInStack = stackQuery(
        (sharedId, child) => visible.get(sharedId) === child,
        true
    )

    const isPreviousInStack = stackQuery(
        (sharedId, child) => previous.get(sharedId) === child,
        false
    )

    const getPreviousOrigin = stackQuery(
        sharedId =>
            previous.get(sharedId)?.measuredOrigin || snapshots.get(sharedId)
    )

    const getPreviousTarget = stackQuery(
        sharedId => previous.get(sharedId)?.measuredTarget
    )

    const getVisibleOrigin = stackQuery(
        sharedId => visible.get(sharedId)?.measuredOrigin
    )

    const getVisibleTarget = stackQuery(
        sharedId => visible.get(sharedId)?.measuredTarget
    )

    const isVisibleInStackPresent = stackQuery(sharedId => {
        const visibleInStack = visible.get(sharedId)
        return visibleInStack && visibleInStack.isPresent()
    }, false)

    const isOnlyMemberOfStack = stackQuery(sharedId => {
        const stack = stacks.get(sharedId)
        return !stack ? true : stack.length <= 1
    }, true)

    const getSnapshot = stackQuery(sharedId => snapshots.get(sharedId))

    const isRootChild = (child: Magic) => child.depth === rootDepth

    const crossfadeAnimation = (child: Magic) => {
        let origin: Snapshot | undefined
        let target: Snapshot | undefined
        let crossfadeEasing: Easing | undefined

        if (isVisibleInStack(child)) {
            if (child.isPresent() && child.shouldResumeFromPrevious) {
                // If this component is newly added and entering, animate out from
                // the previous component
                origin = getPreviousOrigin(child)

                if (
                    isRootChild(child) &&
                    !(isOnlyMemberOfStack(child) && getSnapshot(child))
                ) {
                    crossfadeEasing = crossfadeIn
                    origin = opacity(origin || child.measuredTarget, 0)
                }
            } else if (!child.isPresent()) {
                // Or if this child is being removed, animate to the previous component
                target = getPreviousTarget(child)

                if (isRootChild(child)) {
                    crossfadeEasing = crossfadeOut
                    target = opacity(target || child.measuredTarget, 0)
                }
            }
        } else if (isPreviousInStack(child)) {
            if (isVisibleInStackPresent(child)) {
                // If the visible child in this stack is present, animate this component to it
                target = getVisibleTarget(child)

                if (isRootChild(child)) {
                    crossfadeEasing = crossfadeOut
                    target = opacity(target, 0)
                }
            } else {
                // If the visible child in this stack is being removed, animate from it
                origin = getVisibleOrigin(child)

                if (isRootChild(child)) {
                    crossfadeEasing = crossfadeIn
                }
            }
        }

        child.shouldResumeFromPrevious = false
        child.startAnimation({
            origin,
            target,
            transition,
            crossfadeEasing,
        })
    }

    /**
     *
     */
    const switchAnimation = (child: Magic) => {
        if (isVisibleInStack(child)) {
            let origin: Snapshot | undefined
            let target: Snapshot | undefined

            if (child.isPresent()) {
                if (child.shouldResumeFromPrevious) {
                    origin = getPreviousOrigin(child)
                }

                if (child.shouldRestoreVisibility) {
                    child.show(true)
                    return
                }
            } else {
                target = getPreviousTarget(child)
            }

            child.startAnimation({ origin, target, transition })
        } else {
            if (isPreviousInStack(child)) child.hide(true)

            if (!child.isPresent()) child.safeToRemove()
        }
        child.shouldResumeFromPrevious = false
    }

    return {
        snapshotTarget: child => {
            if (isVisibleInStack(child) || isPreviousInStack(child)) {
                child.snapshotTarget()
            }
        },
        startAnimation: crossfade ? crossfadeAnimation : switchAnimation,
    }
}

const crossfadeIn = compress(0, 0.5, circOut)
const crossfadeOut = compress(0.5, 0.95, linear)

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
