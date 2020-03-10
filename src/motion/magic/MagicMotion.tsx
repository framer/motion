import * as React from "react"
import { MagicContextUtils } from "./types"
import { MagicContext } from "./MagicContext"
import { Magic } from "./Magic"

interface Props {
    children: React.ReactNode
}

type Stack = Magic[]

export class MagicMotion extends React.Component<Props, MagicContextUtils> {
    private hasMounted = false

    private children = new Set<Magic>()

    private stacks = new Map<string, Stack>()

    private snapshots = new Map<string, number>()

    state = {
        forceRender: (): void => this.setState({ ...this.state }),
        register: (child: Magic) => this.register(child),
    }

    shouldComponentUpdate() {
        this.children.forEach(child => child.resetRotation())

        // TODO: `magicKey` performance enhancememnt
        return true
    }

    getSnapshotBeforeUpdate() {
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
        const depthOrdered = Array.from(this.children).sort(sortByDepth)

        depthOrdered.forEach(child => child.resetStyles())
        depthOrdered.forEach(child => !child.isHidden && child.snapshotNext())
        depthOrdered.forEach(child => !child.isHidden && child.startAnimation())
    }

    register(child: Magic) {
        this.children.add(child)

        const { magicId } = child.props

        if (magicId) {
            const stack = this.getStack(magicId)
            stack.push(child)
            this.hasMounted && this.resumeSharedElement(magicId, child, stack)
        }

        return () => {
            this.children.delete(child)

            if (!magicId) return

            const stack = this.getStack(magicId)
            const index = stack.findIndex(
                ({ props }) => props.magicId === magicId
            )

            // Unhide previous in stack here

            index !== 1 && stack.splice(index, 1)
        }
    }

    resumeSharedElement(id: string, child: Magic, stack: Stack) {
        const snapshot = this.snapshots.get(id)

        if (!snapshot) return

        child.prev = snapshot
        const previousChild = stack[stack.length - 2]
        previousChild.isHidden = true
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

const sortByDepth = (a: Magic, b: Magic) => a.depth - b.depth
