import * as React from "react"
import { MagicContextUtils, Snapshot } from "./types"
import { MagicContext } from "./MagicContext"
import { Magic } from "./Magic"
import { batchUpdate } from "./utils"

/**
 * TODO:
 * - Reimplement exit animation (reverse FLIP)
 * - Make work without MagicMotion wrapper
 */

interface Props {
    children: React.ReactNode
}

type Stack = Magic[]

/**
 * @public
 */
export class MagicMotion extends React.Component<Props, MagicContextUtils> {
    private hasMounted = false

    private children = new Set<Magic>()

    private stacks = new Map<string, Stack>()

    private snapshots = new Map<string, Snapshot>()

    private update = batchUpdate()

    state = {
        forceRender: (): void => this.setState({ ...this.state }),
        register: (child: Magic) => this.register(child),
    }

    getSnapshotBeforeUpdate() {
        this.children.forEach(child => child.resetRotation())
        this.children.forEach(child => child.snapshot())

        this.stacks.forEach((stack, id) => {
            const latestChild = stack[stack.length - 1]
            if (latestChild) {
                this.snapshots.set(id, latestChild.prev)
            }
        })

        return null
    }

    componentDidMount() {
        this.hasMounted = true
    }

    componentDidUpdate() {
        this.children.forEach(child => this.update.add(child))
        this.update.flush()
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

        child.prev = snapshot

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

    render() {
        return (
            <MagicContext.Provider value={this.state}>
                {this.props.children}
            </MagicContext.Provider>
        )
    }
}
