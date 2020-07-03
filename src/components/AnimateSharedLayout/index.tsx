import * as React from "react"
import { SharedLayoutProps, Presence } from "./types"
import { createCrossfadeAnimation, createSwitchAnimation } from "./animations"
import { LayoutStack } from "./stack"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import {
    SharedLayoutSyncMethods,
    createBatcher,
    SyncLayoutLifecycles,
    SharedLayoutContext,
} from "./SharedLayoutContext"
import { motionValue } from "../../value"

const defaultLayoutTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

export class AnimateSharedLayout extends React.Component<SharedLayoutProps> {
    private children = new Set<HTMLVisualElement>()

    /**
     * As animate components with a defined `layoutId` are added/removed to the tree,
     * we store them in order. When one is added, it will animate out from the
     * previous one, and when it's removed, it'll animate to the previous one.
     */
    private stacks: Map<string, LayoutStack> = new Map()

    private hasMounted = false

    private updateScheduled = false

    private rootDepth: number

    syncContext: SharedLayoutSyncMethods = {
        ...createBatcher(),
        syncUpdate: (force = false) => {
            if (force || !this.updateScheduled) this.scheduleUpdate()
        },
        forceUpdate: () => {
            this.syncContext = { ...this.syncContext }
            this.scheduleUpdate()
        },
        register: (child: HTMLVisualElement) => this.addChild(child),
    }

    state = {}

    componentDidMount() {
        this.hasMounted = true
        this.stacks.forEach(stack => stack.updateLeadAndFollow())
    }

    componentDidUpdate() {
        this.startAnimation()
    }

    startAnimation() {
        const { type } = this.props

        /**
         * Update presence metadata based on the latest AnimatePresence status.
         * This is a kind of goofy way of dealing with this, perhaps there's a better model to find.
         */
        this.children.forEach(child => {
            if (!child.isPresent) {
                child.presence = Presence.Exiting
            } else if (child.presence !== Presence.Entering) {
                child.presence =
                    child.presence === Presence.Exiting
                        ? Presence.Entering
                        : Presence.Present
            }
        })

        /**
         * In every layoutId stack, nominate a component to lead the animation and another
         * to follow
         */
        this.stacks.forEach(stack => stack.updateLeadAndFollow())

        /**
         * Decide which animation to use between shared layoutId components
         */
        const createAnimation =
            type === "crossfade"
                ? createCrossfadeAnimation
                : createSwitchAnimation

        /**
         * Create a handler which we can use to flush the children animations
         */
        const handler: SyncLayoutLifecycles = {
            measureLayout: child => child.measureLayout(),
            layoutReady: child => {
                const { layoutId } = child
                const animationConfig = createAnimation(
                    child,
                    child.depth === this.rootDepth,
                    this.getStack(layoutId)
                )

                child.layoutReady()
            },
        }

        /**
         * Shared layout animations can be used without the AnimateSharedLayout wrapping component.
         * This requires some co-ordination across components to stop layout thrashing
         * and ensure measurements are taken at the correct time.
         *
         * Here we use that same mechanism of schedule/flush.
         */
        this.children.forEach(child => this.syncContext.add(child))
        this.syncContext.flush(handler)

        /**
         * Clear snapshots so subsequent rerenders don't retain memory of outgoing components
         */
        this.stacks.forEach(stack => (stack.snapshot = undefined))

        /**
         * Reset updateScheduled status
         */
        this.updateScheduled = false
    }

    scheduleUpdate() {
        /**
         * Flag we've scheduled an update
         */
        this.updateScheduled = true

        /**
         * Snapshot children
         */
        this.children.forEach(child => child.snapshotBoundingBox())

        /**
         * Every child keeps a local snapshot, but we also want to record
         * snapshots of the visible children as, if they're are being removed
         * in this render, we can still access them.
         */
        this.stacks.forEach(stack => stack.updateSnapshot())

        /**
         * Force a rerender by setting state
         */
        this.setState({})
    }

    addChild(child: HTMLVisualElement) {
        this.setRootDepth(child)
        this.children.add(child)
        this.addToStack(child)

        child.presence = this.hasMounted ? Presence.Entering : Presence.Present

        return () => this.removeChild(child)
    }

    removeChild(child: HTMLVisualElement) {
        this.children.delete(child)
        this.removeFromStack(child)
    }

    addToStack(child: HTMLVisualElement) {
        const stack = this.getStack(child.layoutId)
        stack?.add(child)
    }

    removeFromStack(child: HTMLVisualElement) {
        const stack = this.getStack(child.layoutId)
        stack?.remove(child)
    }

    setRootDepth(child: HTMLVisualElement) {
        if (this.rootDepth === undefined) {
            this.rootDepth = child.depth
        } else {
            this.rootDepth = Math.min(child.depth, this.rootDepth)
        }
    }

    /**
     * Return a stack of animate children based on the provided layoutId.
     * Will create a stack if none currently exists with that layoutId.
     */
    getStack(id?: string): LayoutStack | undefined {
        if (id === undefined) return

        // Create stack if it doesn't already exist
        !this.stacks.has(id) && this.stacks.set(id, new LayoutStack())

        return this.stacks.get(id) as LayoutStack
    }

    render() {
        return (
            <SharedLayoutContext.Provider value={this.syncContext}>
                {this.props.children}
            </SharedLayoutContext.Provider>
        )
    }
}

/**
 * @public
 */
// export class AnimateSharedLayout extends React.Component<
//     SharedLayoutProps,
//     SharedLayoutTree
// > {
//     /**
//      * Keep track of all animate children.
//      */
//     private children = new Set<Auto>()

//     /**
//      * Keep track of the depth of the most shallow animate child
//      * so we can identify root animate children.
//      */
//     private rootDepth: number

//     /**
//      * This flag determines whether we re-run snapshots and run animate transitions.
//      */
//     private shouldTransition: boolean

//     /**
//      * Create an instance of the update batcher so we can run snapshots across
//      * components and fire animate transitions in the correct order.
//      */
//     private batch = batchTransitions()

//     /**
//      * We're tracking mount status as only subsequently-entering components need
//      * tagging with `shouldResumeFromPrevious`.
//      */
//     private hasMounted = false

//     /**
//      * Keep track of whether we're currently animating layout and block forced re-renders
//      * until we're not.
//      */
//     private isAnimating = false

//     /**
//      * If a forced re-render is triggered while there's a shared layout animation we block
//      * it and check this boolean after all animations are complete.
//      */
//     private shouldRerender = false

//     state = {
//         /**
//          * Allow children, like AnimatePresence, to force-render this component
//          * to ensure animate children correctly identify parallel state changes that
//          * might affect their layout.
//          */
//         forceRender: (): void => {
//             if (!this.isAnimating) {
//                 this.shouldRerender = false
//                 this.setState({ ...this.state })
//             } else {
//                 this.shouldRerender = true
//             }
//         },

//         register: (child: Auto) => this.addChild(child),
//         move: (child: Auto) => {
//             this.removeChildFromStack(child)
//             this.addChildToStack(child)
//         },
//     }

//     /**
//      * We always want the component to re-render but for performance reasons we might
//      * want to control whether we take snapshots and perform animate transitions.
//      */
//     shouldComponentUpdate(
//         nextProps: SharedLayoutProps,
//         nextState: SharedLayoutTree
//     ) {
//         this.shouldTransition = false

//         if (this.state !== nextState) {
//             // This should always be true if we've got a new state as a result of a forced render
//             this.shouldTransition = true
//         } else {
//             // If we don't have a defined dependency, or we do and it's changed,
//             // we want to transition
//             const { dependency } = this.props
//             const hasDependency = !!(dependency ?? nextProps.dependency)
//             const hasChanged = dependency !== nextProps.dependency

//             this.shouldTransition =
//                 !hasDependency || (hasDependency && hasChanged)
//         }

//         /**
//          * Reset rotation on all children so we can properly measure the correct bounding box.
//          * The supportRotate prop isn't public API so this should only run in Framer.
//          *
//          * Ideally this would run in getSnapshotBeforeUpdate as shouldComponentUpdate may run
//          * multiple times in concurrent mode, but currently this is introducing bugs.
//          */
//         if (this.shouldTransition) {
//             const { supportRotate } = this.props
//             supportRotate &&
//                 this.children.forEach(child => child.resetRotation())
//         }

//         return true
//     }

//     /**
//      * Loop through all children and update their latest origin snapshots.
//      */
//     getSnapshotBeforeUpdate() {
//         if (!this.shouldTransition) return null

//         /**
//          * Snapshot the visual origin of every child.
//          */
//         this.children.forEach(child => child.snapshotOrigin())

//         /**
//          * Every child keeps a local snapshot, but we also want to record
//          * snapshots of the visible children as, if they're are being removed
//          * in this render, we can still access them.
//          */
//         this.stacks.forEach(stack => stack.updateSnapshot())

//         return null
//     }

//     /**
//      * Once all children have updated, snapshot their target snapshots and run
//      * animate transitions.
//      */
//     componentDidUpdate() {
//         // TODO: This would currently prevent animate children from working
//         this.shouldTransition && this.startAnimation()
//     }

//     /**
//      * Register a new `Auto` child
//      */
// addChild(child: Auto) {
//     this.setRootDepth(child)
//     this.children.add(child)

//     child.presence = this.hasMounted ? Presence.Entering : Presence.Present

//     this.addChildToStack(child)

//     return () => this.removeChild(child)
// }

// addChildToStack(child: Auto) {
//     const { layoutId } = child.props
//     if (layoutId === undefined) return

//     const stack = this.getStack(layoutId)
//     stack.add(child)
// }

//     removeChild(child: Auto) {
//         this.children.delete(child)
//         this.removeChildFromStack(child)
//     }

//     removeChildFromStack(child: Auto) {
//     }

//     /**
//      * The root depth is the shallowest `depth` of all our children.
//      * Children with the shallowest depth get used to crossfade between trees.
//      */
//     setRootDepth(child: Auto) {
//         if (this.rootDepth === undefined) {
//             this.rootDepth = child.depth
//         } else {
//             this.rootDepth = Math.min(child.depth, this.rootDepth)
//         }
//     }

//     startAnimation() {
//         const { type, transition = defaultLayoutTransition } = this.props
//         const options = { type, transition }

//         const createAnimation =
//             type === "crossfade"
//                 ? createCrossfadeAnimation
//                 : createSwitchAnimation

//         // Update presence metadata based on latest AnimatePresence status
//         this.children.forEach(child => {
//             if (!child.isPresent()) {
//                 child.presence = Presence.Exiting
//             } else if (child.presence !== Presence.Entering) {
//                 child.presence =
//                     child.presence === Presence.Exiting
//                         ? Presence.Entering
//                         : Presence.Present
//             }
//         })

//         this.stacks.forEach(stack => stack.updateLeadAndFollow())

//         const handler: TransitionHandler = {
//             snapshotTarget: child => {
//                 const { layoutId } = child.props
//                 const stack =
//                     layoutId !== undefined ? this.getStack(layoutId) : undefined

//                 if (
//                     // If this component has an animate prop
//                     isAutoAnimate(child) ||
//                     // If this component is either entering or present
//                     child.presence !== Presence.Exiting ||
//                     // If the lead component in the stack is present and should animate, snapshot
//                     // TODO: Figure out what this breaks if removed
//                     (stack?.lead?.isPresent() && stack?.shouldStackAnimate())
//                 ) {
//                     child.snapshotTarget()
//                 }
//             },
//             startAnimation: child => {
//                 let numAnimations = 0
//                 let numCompletedAnimations = 0

//                 const { layoutId } = child.props
//                 const stack =
//                     layoutId !== undefined ? this.getStack(layoutId) : undefined

//                 const config = createAnimation(
//                     child,
//                     child.depth === this.rootDepth,
//                     stack
//                 )

//                 const animation = child.startAnimation({
//                     ...options,
//                     ...config,
//                     shouldAnimate: stack?.shouldStackAnimate(),
//                 })

//                 if (!animation) return

//                 this.isAnimating = true
//                 numAnimations++

//                 animation.then(() => {
//                     if (child.isPresent()) child.presence = Presence.Present
//                     numCompletedAnimations++

//                     if (numCompletedAnimations >= numAnimations) {
//                         this.isAnimating = false
//                     }

//                     if (this.shouldRerender && !this.isAnimating) {
//                         this.state.forceRender()
//                     }
//                 })
//             },
//         }
//         /**
//          * Shared layout animations can be used without the AnimateSharedLayout wrapping component.
//          * This requires some co-ordination across components to stop layout thrashing
//          * and ensure measurements are taken at the correct time.
//          *
//          * Here we use that same mechanism of schedule/flush.
//          */
//         this.children.forEach(child => this.batch.add(child))
//         this.batch.flush(handler)

//         /**
//          * Clear snapshots so subsequent rerenders don't retain memory of outgoing components
//          */
//         this.stacks.forEach(stack => (stack.snapshot = undefined))
//     }

//     render() {
//         return (
//             <SharedLayoutContext.Provider value={this.state}>
//                 {this.props.children}
//             </SharedLayoutContext.Provider>
//         )
//     }
// }

// function isAutoAnimate(child: Auto) {
//     return child.props.animate === true
// }
