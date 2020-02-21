import * as React from "react"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { FunctionalProps } from "../functionality/types"
import { Snapshot, BoxDelta, Style, AxisDelta } from "./types"
import { flushTree, syncTree } from "../../utils/tree-sync"
import { snapshot, calcBoxDelta, applyTreeDeltas } from "./utils"
import { NativeElement } from "../utils/use-native-element"
import { syncRenderSession } from "../../dom/sync-render-session"
import { TargetAndTransition, Transition } from "../../types"

const autoKey = "auto"
const subId = Symbol(autoKey)

// TODO: Look into moving this to a context
const continuity = new Map<string, Snapshot>()

export class Auto extends React.Component<FunctionalProps> {
    static contextType = SyncLayoutContext

    prev: Snapshot

    constructor(props: FunctionalProps) {
        super(props)

        if (props.autoId === undefined) return

        // If we have an `autoId` prop, bind component continuity events to element lifecycle
        props.nativeElement.onMount(subId, () => this.resume())
        props.nativeElement.onUnmount(subId, element => this.save(element))
    }

    /**
     * Measure the current state of the DOM before it's updated, and schedule transition checks.
     * The lack of this specific lifecycle event in hooks is why this component is a class.
     */
    getSnapshotBeforeUpdate() {
        const { nativeElement } = this.props
        this.prev = snapshot(nativeElement)
        this.scheduleTransition()

        return null
    }

    componentDidUpdate() {
        flushTree(autoKey)
    }

    componentDidMount() {
        flushTree(autoKey)
    }

    save(nativeElement: NativeElement) {
        const { autoId } = this.props
        if (autoId === undefined) return

        continuity.set(autoId, snapshot(nativeElement))
    }

    resume() {
        const { autoId } = this.props
        if (autoId === undefined) return

        const prev = continuity.get(autoId)
        if (!prev) return

        this.prev = prev
        this.scheduleTransition()

        continuity.delete(autoId)
    }

    scheduleTransition() {
        const { nativeElement, parentContext, localContext } = this.props

        const element = nativeElement.getInstance()

        let transform: string | null
        let next: Snapshot
        let layoutDelta: BoxDelta

        syncTree(autoKey, (up, down) => {
            // Read: Store any existing `transform` style so we can re-apply it if
            // we're not doing any layout transition.
            // TODO: We might need to do this for styles as the `style` prop is overriding
            // anything from React props or other CSS
            up(() => (transform = (element as HTMLElement).style.transform))

            // Write: Remove the `transform` prop so we can correctly read its new layout position
            up(() => ((element as HTMLElement).style.transform = ""))

            // Read: Take a new snapshot and diff with the previous one
            down(() => {
                next = snapshot(nativeElement)
                const treeDeltas = parentContext.deltas || []
                next.layout = applyTreeDeltas(treeDeltas, next.layout)
                layoutDelta = calcBoxDelta(this.prev.layout, next.layout)
                localContext.deltas = [...treeDeltas, layoutDelta]

                // TODO: Temporary hack
                if (treeDeltas.length !== 0) {
                    nativeElement.setStyle(
                        "transform",
                        ({ scaleX = 1, scaleY = 1, x = 0, y = 0 }: any) =>
                            `scaleX(${scaleX}) scaleY(${scaleY}) translate(${x}, ${y}) translateZ(0)`
                    )
                }
            })

            // Write: Apply deltas and animate
            up(() => {
                syncRenderSession.open()

                this.transitionLayout(layoutDelta, transform)
                this.transitionStyle(next.style)

                syncRenderSession.flush()
            })
        })
    }

    transitionLayout(delta: BoxDelta, _fallbackTransform: string | null) {
        let shouldTransitionLayout = false
        const target: TargetAndTransition = {}
        const transition: Transition = {}
        const { controls, nativeElement, values } = this.props

        // TODO: Add logic to decide here whether to go ahead with layout transition

        nativeElement.setStyle({
            originX: delta.x.origin,
            originY: delta.y.origin,
        })

        function makeTransition(key: string, from: number, to: number) {
            shouldTransitionLayout = true
            // TODO Get layout-specific transition here
            // TODO Set transition
            const value = values.get(key, to)
            const velocity = value.getVelocity()

            transition[key] = { velocity }

            target[key] = to
            value.set(from)
        }

        function makeAxisTransition(
            axis: AxisDelta,
            key: string,
            scaleKey: string
        ) {
            if (axis.translate) makeTransition(key, axis.translate, 0)
            if (axis.scale !== 1) makeTransition(scaleKey, axis.scale, 1)
        }

        makeAxisTransition(delta.x, "x", "scaleX")
        makeAxisTransition(delta.y, "y", "scaleY")

        target.transition = transition
        shouldTransitionLayout && controls.start(target)
    }

    // TODO: Handle border-radius inversion if we're inverting scale
    transitionStyle(next: Style) {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const transition: Transition = {}
        const { controls, values } = this.props
        const prev = this.prev.style

        for (const key in prev) {
            const prevStyle = prev[key]
            const nextStyle = next[key]

            if (prevStyle !== nextStyle) {
                shouldTransitionStyle = true
                const value = values.get(key, prevStyle)
                value.set(prevStyle)

                // TODO: Get from `transition` or `autoTransition` prop
                transition[key] = {}
                target[key] = nextStyle
            }
        }

        target.transition = transition
        shouldTransitionStyle && controls.start(target)
    }

    render() {
        return null
    }
}
