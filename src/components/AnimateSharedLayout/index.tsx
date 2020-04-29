import * as React from "react"
import {
    SharedLayoutTree,
    SharedLayoutProps,
    TransitionHandler,
    Presence,
} from "./types"
import { SharedLayoutContext } from "./SharedLayoutContext"
import { Auto } from "../../motion/features/auto/Auto"
import { batchTransitions } from "../../motion/features/auto/utils"
import { createCrossfadeAnimation, createSwitchAnimation } from "./animations"
import { LayoutStack } from "./Stack"

const defaultLayoutTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
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
    private stacks: Map<string, LayoutStack<Auto>> = new Map()

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

    state = {
        /**
         * Allow children, like AnimatePresence, to force-render this component
         * to ensure animate children correctly identify parallel state changes that
         * might affect their layout.
         *
         * TODO: Don't trigger rerender in the middle of layout animation, just mark
         * as rerenderable
         */
        forceRender: (): void => this.setState({ ...this.state }),

        register: (child: Auto) => this.addChild(child),
    }

    componentDidMount() {
        this.hasMounted = true
        this.stacks.forEach(stack => stack.updateLeadAndFollow())
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
        this.stacks.forEach(stack => stack.updateSnapshot())

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
     * Register a new `Auto` child
     */
    addChild(child: Auto) {
        this.setRootDepth(child)
        this.children.add(child)

        child.presence = this.hasMounted ? Presence.Entering : Presence.Present

        this.addChildToStack(child)

        return () => this.removeChild(child)
    }

    addChildToStack(child: Auto) {
        const { layoutId } = child.props
        if (layoutId === undefined) return

        const stack = this.getStack(layoutId)
        stack.add(child)
    }

    removeChild(child: Auto) {
        this.children.delete(child)
        this.removeChildFromStack(child)
    }

    removeChildFromStack(child: Auto) {
        const { layoutId } = child.props
        if (layoutId === undefined) return

        const stack = this.getStack(layoutId)
        stack.remove(child)
    }

    /**
     * Return a stack of animate children based on the provided layoutId.
     * Will create a stack if none currently exists with that layoutId.
     */
    getStack(id: string): LayoutStack<Auto> {
        !this.stacks.has(id) && this.stacks.set(id, new LayoutStack())

        return this.stacks.get(id) as LayoutStack<Auto>
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
        const { type, transition = defaultLayoutTransition } = this.props
        const options = { type, transition }

        const createAnimation =
            type === "crossfade"
                ? createCrossfadeAnimation
                : createSwitchAnimation

        // Update presence metadata based on latest AnimatePresence status
        this.children.forEach(child => {
            if (!child.isPresent()) {
                child.presence = Presence.Exiting
            } else if (child.presence !== Presence.Entering) {
                child.presence =
                    child.presence === Presence.Exiting
                        ? Presence.Entering
                        : Presence.Present
            }
        })

        this.stacks.forEach(stack => stack.updateLeadAndFollow())

        const handler: TransitionHandler = {
            snapshotTarget: child => {
                const { layoutId } = child.props
                const stack =
                    layoutId !== undefined ? this.getStack(layoutId) : undefined

                if (
                    // If this component has an animate prop
                    isAutoAnimate(child) ||
                    // If this component is either entering or present
                    child.presence !== Presence.Exiting ||
                    // If the lead component in the stack is present, snapshot
                    // TODO: Figure out what this breaks if removed
                    stack?.lead?.isPresent()
                ) {
                    child.snapshotTarget()
                }
            },
            startAnimation: child => {
                const { layoutId } = child.props
                const stack =
                    layoutId !== undefined ? this.getStack(layoutId) : undefined

                const config = createAnimation(
                    child,
                    child.depth === this.rootDepth,
                    stack
                )

                const animation = child.startAnimation({
                    ...options,
                    ...config,
                })

                if (animation) {
                    animation.then(() => {
                        if (child.isPresent()) child.presence = Presence.Present
                    })
                }
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

        /**
         * Clear snapshots so subsequent rerenders don't retain memory of outgoing components
         */
        this.stacks.forEach(stack => (stack.snapshot = undefined))
    }

    render() {
        return (
            <SharedLayoutContext.Provider value={this.state}>
                {this.props.children}
            </SharedLayoutContext.Provider>
        )
    }
}

function isAutoAnimate(child: Auto) {
    return child.props.animate === true
}
