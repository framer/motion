import * as React from "react"
import {
    MagicControlledTree,
    Snapshot,
    StackQuery,
    MagicMotionProps,
    TransitionHandler,
    MagicAnimationOptions,
} from "./types"
import { MagicContext } from "./MagicContext"
import { Magic } from "./Magic"
import { batchTransitions } from "./utils"
import { Transition } from "../../types"

type MagicStack = Magic[]
type MagicStacks = Map<string, MagicStack>

const defaultMagicTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

/**
 * @public
 */
export class MagicMotion extends React.Component<
    MagicMotionProps,
    MagicControlledTree
> {
    /**
     * Keep track of all magic children.
     */
    private children = new Set<Magic>()

    /**
     * As magic components with a defined `magicId` are added/removed to the tree,
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

    state = {
        /**
         * Allow children, like AnimatePresence, to force-render this component
         * to ensure magic children correctly identify parallel state changes that
         * might affect their layout.
         */
        forceRender: (): void => this.setState({ ...this.state }),

        register: (child: Magic) => this.addChild(child),
    }

    /**
     * We always want the component to re-render but for performance reasons we might
     * want to control whether we take snapshots and perform magic transitions.
     */
    shouldComponentUpdate(
        nextProps: MagicMotionProps,
        nextState: MagicControlledTree
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
        if (!this.shouldTransition) return

        this.children.forEach(child => child.snapshotOrigin())

        return null
    }

    /**
     * Once all children have updated, snapshot their target snapshots and run
     * magic transitions.
     */
    componentDidUpdate() {
        if (!this.shouldTransition) return

        /**
         * Magic animations can be used without the MagicMotion wrapping component.
         * This requires some co-ordination across components to stop layout thrashing
         * and ensure measurements are taken at the correct time.
         *
         * Here we use that same mechanism of schedule/flush.
         */
        this.children.forEach(child => this.batch.add(child))
        const { crossfade, transition = defaultMagicTransition } = this.props
        const options = { crossfade, transition }
        const handler = controlledHandler(options, this.rootDepth, this.stacks)
        this.batch.flush(handler)
    }

    /**
     * Register a new `Magic` child
     */
    addChild(child: Magic) {
        this.setRootDepth(child)
        this.children.add(child)
        this.addChildToStack(child)
        child.shouldResumeFromPrevious = true
        return () => this.removeChild(child)
    }

    addChildToStack(child: Magic) {
        const { magicId } = child.props
        if (magicId === undefined) return

        const stack = this.getStack(magicId)
        stack.push(child)

        const previousChild = stack[stack.length - 2]
        previousChild && previousChild.hide()
    }

    removeChild(child: Magic) {
        this.children.delete(child)
        this.removeChildFromStack(child)
    }

    removeChildFromStack(child: Magic) {
        const { magicId } = child.props
        if (magicId === undefined) return

        const stack = this.getStack(magicId)
        const childIndex = stack.findIndex(stackChild => child === stackChild)
        if (childIndex === -1) return

        stack.splice(childIndex, 1)

        // Set the previous child to visible
        const previousChild = stack[childIndex - 1]
        previousChild && previousChild.show()
    }

    /**
     * Return a stack of magic children based on the provided magicId.
     * Will create a stack if none currently exists with that magicId.
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

function controlledHandler(
    { transition, crossfade }: MagicAnimationOptions,
    rootDepth: number,
    stacks: MagicStacks
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

    const isVisibleInStack = (child: Magic) => {
        const { magicId } = child.props
        return magicId === undefined ? true : visible.get(magicId) === child
    }

    const isPreviousInStack = (child: Magic) => {
        const { magicId } = child.props
        return magicId === undefined ? false : previous.get(magicId) === child
    }

    const getPreviousOrigin = (child: Magic) => {
        const { magicId } = child.props
        return magicId === undefined
            ? undefined
            : previous.get(magicId)?.measuredOrigin
    }

    const getPreviousTarget = (child: Magic) => {
        const { magicId } = child.props
        return magicId === undefined
            ? undefined
            : previous.get(magicId)?.measuredTarget
    }

    const isRootChild = (child: Magic) => child.depth === rootDepth

    const crossfadeAnimation = () => {}

    const switchAnimation = (child: Magic) => {
        if (isVisibleInStack(child)) {
            let origin: Snapshot | undefined
            let target: Snapshot | undefined

            if (child.isPresent()) {
                if (child.shouldResumeFromPrevious) {
                    origin = getPreviousOrigin(child)
                    child.shouldResumeFromPrevious = false
                }

                if (child.shouldRestoreVisibility) {
                    child.show(true)
                    return
                }
            } else {
                target = getPreviousTarget(child)
            }

            child.startAnimation({ origin, target, transition })
        } else if (isPreviousInStack(child)) {
            child.hide(true)
        }
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

// export class MagicMotion extends React.Component<Props, MagicControlledTree> {
//     private hasMounted = false

//     private children = new Set<Magic>()

//     private stacks = new Map<string, Stack>()

//     private snapshots = new Map<string, Snapshot>()

//     private update = batchUpdate()

//     private shouldTransition = true

//     state = {
//         forceRenderCount: 0,
//         forceRender: (): void =>
//             this.setState({
//                 ...this.state,
//                 forceRenderCount: this.state.forceRenderCount + 1,
//             }),
//         register: (child: Magic) => this.register(child),
//     }

//     shouldComponentUpdate(nextProps: Props, nextState: MagicControlledTree) {
//         const hasDependency =
//             this.props.dependency !== undefined ||
//             nextProps.dependency !== undefined

//         const dependencyHasChanged =
//             this.props.dependency !== nextProps.dependency

//         this.shouldTransition =
//             !hasDependency ||
//             (hasDependency && dependencyHasChanged) ||
//             nextState.forceRenderCount !== this.state.forceRenderCount

//         if (this.shouldTransition) {
//             this.children.forEach(child => child.resetRotation())
//         }

//         return true
//     }

//     getSnapshotBeforeUpdate() {
//         if (!this.shouldTransition) return

//         this.children.forEach(child => child.snapshotOrigin())

//////////////////// TODO: Reinstate this functionality?
//         this.stacks.forEach((stack, id) => {
//             const latestChild = stack[stack.length - 1]
//             if (latestChild) {
//                 this.snapshots.set(id, latestChild.measuredOrigin)
//             }
//         })

//         return null
//     }

//     componentDidMount() {
//         this.hasMounted = true
//     }

//     componentDidUpdate() {
//         if (!this.shouldTransition) return

//         this.children.forEach(child => this.update.add(child))

//         const { transition = defaultMagicTransition, crossfade } = this.props
//         this.update.flush(this.getStackQuery(), {
//             transition,
//             crossfade,
//         })
//     }

//     register(child: Magic) {
//         this.children.add(child)

//         const { magicId } = child.props

//         if (magicId !== undefined) {
//             const stack = this.getStack(magicId)
//             stack.push(child)
//             this.hasMounted && this.resumeSharedElement(magicId, child, stack)
//         }

//         return () => this.removeChild(child)
//     }

//     removeChild(child: Magic) {
//         this.children.delete(child)

//         // TODO: This might have changed between renders
//         const { magicId } = child.props
//         if (!magicId) return

//         const stack = this.getStack(magicId)
//         const index = stack.findIndex(stackChild => child === stackChild)
//         if (index === -1) return
//         stack.splice(index, 1)

//         const previousChild = stack[index - 1]
//         if (previousChild) previousChild.show()
//     }

//     resumeSharedElement(id: string, child: Magic, stack: Stack) {
//         const snapshot = this.snapshots.get(id)
//         if (!snapshot) return

//         child.measuredOrigin = snapshot

//         // Hack, fix this and
//         if (this.props.crossfade)
//             child.measuredOrigin = opacity(child.measuredOrigin, 0)

//         // If we have more than one child in this stack, hide the
//         // previous child
//         const stackLength = stack.length
//         if (stackLength > 1) {
//             const previousChild = stack[stackLength - 2]
//             previousChild.hide()
//         }
//     }

//     getStack(id: string) {
//         if (!this.stacks.has(id)) {
//             this.stacks.set(id, [])
//         }

//         return this.stacks.get(id) as Stack
//     }

//     getStackQuery(): StackQuery {
//         const data = {}

//         this.stacks.forEach((stack, key) => {
//             const visibleIndex = stack.findIndex(child => !child.isHidden)
//             const visible =
//                 visibleIndex !== -1 ? stack[visibleIndex] : undefined
//             const previousIndex = visibleIndex - 1
//             const previous =
//                 previousIndex !== -1 ? stack[previousIndex] : undefined

//             data[key] = { visible, previous }
//         })

//         const getStack = (child: Magic) => {
//             const { magicId } = child.props
//             return magicId && data[magicId]
//         }

//         return {
//             isPrevious: (child: Magic) => {
//                 const stack = getStack(child)

//                 if (!stack) {
//                     return false
//                 } else {
//                     return stack.previous === child
//                 }
//             },
//             isVisible: (child: Magic) => {
//                 const stack = getStack(child)

//                 if (!stack) {
//                     return false
//                 } else {
//                     return stack.visible === child
//                 }
//             },
//             isVisibleExiting(child: Magic) {
//                 const stack = getStack(child)

//                 if (!stack) {
//                     return false
//                 } else {
//                     return !stack.visible.isPresent()
//                 }
//             },
//             getVisibleOrigin: (child: Magic) => {
//                 const stack = getStack(child)
//                 if (!stack) return
//                 return stack.visible.measuredOrigin
//             },
//             getPreviousOrigin: (child: Magic) => {
//                 const stack = getStack(child)
//                 if (!stack || !stack.previous || child.isPresent()) return
//                 return stack.previous.measuredTarget
//             },
//             getVisibleTarget: (child: Magic) => {
//                 const stack = getStack(child)
//                 if (!stack || !stack.visible) return
//                 return stack.visible.measuredTarget
//             },
//         }
//     }

// }
