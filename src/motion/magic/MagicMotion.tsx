import * as React from "react"
import { MagicControlledTree, Snapshot, StackQuery } from "./types"
import { MagicContext } from "./MagicContext"
import { Magic } from "./Magic"
import { batchUpdate } from "./utils"
import { Transition } from "../../types"

interface Props {
    children: React.ReactNode
    transition?: Transition
    crossfade?: boolean
    dependency?: any
}

type Stack = Magic[]

/**
 * @public
 */
export class MagicMotion extends React.Component<Props, MagicControlledTree> {
    private hasMounted = false

    private children = new Set<Magic>()

    private stacks = new Map<string, Stack>()

    private snapshots = new Map<string, Snapshot>()

    private update = batchUpdate()

    state = {
        forceRender: (): void => this.setState({ ...this.state }),
        register: (child: Magic) => this.register(child),
    }

    shouldComponentUpdate(nextProps: Props) {
        const hasDependency =
            this.props.dependency !== undefined ||
            nextProps.dependency !== undefined

        const dependencyHasChanged =
            this.props.dependency !== nextProps.dependency

        const shouldUpdate =
            !hasDependency || (hasDependency && dependencyHasChanged)

        if (shouldUpdate) {
            this.children.forEach(child => child.resetRotation())
        }

        return shouldUpdate
    }

    getSnapshotBeforeUpdate() {
        this.children.forEach(child => child.snapshotOrigin())

        this.stacks.forEach((stack, id) => {
            const latestChild = stack[stack.length - 1]
            if (latestChild) {
                this.snapshots.set(id, latestChild.measuredOrigin)
            }
        })

        return null
    }

    componentDidMount() {
        this.hasMounted = true
    }

    componentDidUpdate() {
        this.children.forEach(child => this.update.add(child))

        const { transition, crossfade } = this.props
        this.update.flush(this.getStackQuery(), {
            transition,
            crossfade,
        })
    }

    register(child: Magic) {
        this.children.add(child)

        const { magicId } = child.props

        if (magicId) {
            const stack = this.getStack(magicId)
            stack.push(child)
            this.hasMounted && this.resumeSharedElement(magicId, child, stack)
        }

        return () => this.removeChild(child)
    }

    removeChild(child: Magic) {
        this.children.delete(child)

        // TODO: This might have changed between renders
        const { magicId } = child.props
        if (!magicId) return

        const stack = this.getStack(magicId)
        const index = stack.findIndex(stackChild => child === stackChild)
        if (index === -1) return
        stack.splice(index, 1)

        const previousChild = stack[index - 1]
        if (previousChild) previousChild.show()
    }

    resumeSharedElement(id: string, child: Magic, stack: Stack) {
        const snapshot = this.snapshots.get(id)
        if (!snapshot) return

        child.measuredOrigin = snapshot

        // If we have more than one child in this stack, hide the
        // previous child
        const stackLength = stack.length
        if (stackLength > 1) {
            const previousChild = stack[stackLength - 2]
            previousChild.hide()
        }
    }

    getStack(id: string) {
        if (!this.stacks.has(id)) {
            this.stacks.set(id, [])
        }

        return this.stacks.get(id) as Stack
    }

    getStackQuery(): StackQuery {
        const data = {}

        this.stacks.forEach((stack, key) => {
            const visibleIndex = stack.findIndex(child => !child.isHidden)
            const visible =
                visibleIndex !== -1 ? stack[visibleIndex] : undefined
            const previousIndex = visibleIndex - 1
            const previous =
                previousIndex !== -1 ? stack[previousIndex] : undefined

            data[key] = { visible, previous }
        })

        const getStack = (child: Magic) => {
            const { magicId } = child.props
            return magicId && data[magicId]
        }

        return {
            isPrevious: (child: Magic) => {
                const stack = getStack(child)

                if (!stack) {
                    return false
                } else {
                    return stack.previous === child
                }
            },
            isVisible: (child: Magic) => {
                const stack = getStack(child)

                if (!stack) {
                    return false
                } else {
                    return stack.visible === child
                }
            },
            isVisibleExiting(child: Magic) {
                const stack = getStack(child)

                if (!stack) {
                    return false
                } else {
                    return !stack.visible.isPresent()
                }
            },
            getVisibleOrigin: (child: Magic) => {
                const stack = getStack(child)
                if (!stack) return
                return stack.visible.measuredOrigin
            },
            getPreviousOrigin: (child: Magic) => {
                const stack = getStack(child)
                if (!stack || !stack.previous || child.isPresent()) return
                return stack.previous.measuredTarget
            },
            getVisibleTarget: (child: Magic) => {
                const stack = getStack(child)
                if (!stack || !stack.visible) return
                return stack.visible.measuredTarget
            },
        }
    }

    render() {
        return (
            <MagicContext.Provider value={this.state}>
                {this.props.children}
            </MagicContext.Provider>
        )
    }
}
