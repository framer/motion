import * as React from "react"
import { SyncLayoutContext, SyncLayoutChild } from "../../components/SyncLayout"
import { FunctionalProps } from "../functionality/types"
import { Snapshot, BoxDelta, Style, AxisDelta } from "./types"
import { syncTree, flushTree, Session } from "../../utils/tree-sync"
import {
    snapshot,
    calcBoxDelta,
    applyTreeDeltas,
    resetStyles,
    numAnimatableStyles,
    animatableStyles,
    calcTreeScale,
    resolve,
} from "./utils"
import { syncRenderSession } from "../../dom/sync-render-session"
import { TargetAndTransition } from "../../types"
import { motionValue } from "../../value"
import { startAnimation } from "../../animation/utils/transitions"
import { mix } from "@popmotion/popcorn"

/**
 * TODO:
 * - Full-tree border radius inversion
 * - Border radius animation (inc resetting any borderRadius set)
 * - Individual border radius
 * - Popping children from flow on exit via `AnimatePresence`
 * - Fix `AnimatePresence` children scale calculation (see: autoExampleExpandingCTA)
 * - Box shadows
 * - Integrate with `AnimatePresence` so we can do container-style transitions
 * - Allow `auto` to === `false`?
 * - Don't render if static === true
 * - Documentation
 */

export class Auto extends React.Component<FunctionalProps> {
    static contextType = SyncLayoutContext

    prev: Snapshot
    next: Snapshot

    // TODO: Consider replacing this with individual progress values for each transform. We aren't
    // animating these directly because they're being calculated every frame
    progress = motionValue(0)

    // TODO: Add comment to make sure its clear that this is mutative
    delta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }

    detachFromParentLayout?: () => void
    detachFromSyncLayout?: () => void
    cancelSnapshot?: () => void
    cancelTransition?: () => void

    componentDidMount() {
        if (!this.isSyncedTree()) return

        const { autoId } = this.props
        const { register } = this.context

        let syncLayoutChild: SyncLayoutChild = {
            snapshot: () => {
                const prev = this.snapshot()
                this.scheduleTransition(prev)
                return prev
            },
        }

        if (autoId !== undefined) {
            syncLayoutChild = {
                ...syncLayoutChild,
                id: autoId,
                resume: (prev: Snapshot) => this.scheduleTransition(prev),
            }
        }

        this.detachFromSyncLayout = register(syncLayoutChild)
    }

    componentDidUpdate() {
        !this.isSyncedTree() && flushTree("transition")
    }

    shouldComponentUpdate() {
        const { nativeElement } = this.props

        // Maybe only do this if it isnt a synced tree
        this.cancelSnapshot = this.sync("snapshot", schedule => {
            schedule(() => {
                if (nativeElement.getStyle("rotate")) {
                    nativeElement.setStyle({ rotate: 0 })
                    nativeElement.render()
                }
            })
            schedule(() => {
                this.snapshot()
                this.scheduleTransition()
            })
        })

        return true
    }

    /**
     * Measure the current state of the DOM before it's updated, and schedule transition checks.
     * The lack of this specific lifecycle event in hooks is why this component is a class.
     */
    getSnapshotBeforeUpdate() {
        !this.isSyncedTree() && flushTree("snapshot")
        return null
    }

    componentWillUnmount() {
        this.cancelSnapshot && this.cancelSnapshot()
        this.cancelTransition && this.cancelTransition()
        this.detachFromSyncLayout && this.detachFromSyncLayout()
    }

    snapshot() {
        const { nativeElement, values } = this.props

        this.prev = snapshot(nativeElement)

        const rotate = values.get("rotate")
        if (rotate) {
            this.prev.style.rotate = rotate.getPrevious() as number
        }

        return this.prev
    }

    isSyncedTree() {
        return this.context !== null && this.context !== undefined
    }

    sync(id: string, session: Session) {
        const sync = this.isSyncedTree()
            ? (this.context.syncTree as typeof syncTree)
            : syncTree

        return sync(id, session)
    }

    scheduleTransition(prev = this.prev) {
        // Assign incoming prev to this.prev in case it's being provided by SyncLayout's continuity
        this.prev = prev

        const { nativeElement, parentContext, localContext, style } = this.props

        this.cancelTransition = this.sync("transition", schedule => {
            schedule(() => {
                // Write: Remove the `transform` prop so we can correctly read its new layout position,
                // and reset any styles present
                nativeElement.setStyle(resetStyles(style))
                nativeElement.render()
            })

            schedule(() => {
                // Read: Take a new snapshot
                this.next = snapshot(nativeElement)
                this.next.style.rotate = resolve(0, style && style.rotate)

                // Load our layout animation progress into context so children can subscribe
                // and update their layout accordingly.
                // TODO: We might want to split progress into x/y and it would be better to
                // find another way of scheduling this so we don't have to recalculate for every change,
                // or maybe split subscriptions and recalculations per axis
                localContext.autoParentProgress = this.progress

                // Create a delta stack for children to incorporate into their
                // own transform calculations
                localContext.deltas = [
                    ...(parentContext.deltas || []),
                    this.delta,
                ]
            })

            // Write: Apply deltas and animate
            schedule(() => {
                syncRenderSession.open()

                this.transitionLayout()
                this.transitionStyle(prev.style, this.next.style)

                syncRenderSession.flush()
            })
        })
    }

    transitionLayout() {
        const { nativeElement, values, parentContext, transition } = this.props
        const isRotationAnimating =
            this.prev.style.rotate !== this.next.style.rotate

        this.detachFromParentLayout && this.detachFromParentLayout()

        const updateBoundingBoxes = () => {
            // TODO: DON'T BE WASTEFUL HERE - eliminate object creation as this function
            // can potentially run multiple times per frame.

            const parentDeltas = parentContext.deltas || []

            // TODO: Clean this up
            // Use the current progress value to interpolate between the previous and next
            // bounding box before applying and calculating deltas.
            const p = this.progress.get() / 100
            const easedNext = {
                x: { min: 0, max: 0 },
                y: { min: 0, max: 0 },
            }
            easedNext.x.min = mix(
                this.next.layout.x.min,
                this.prev.layout.x.min,
                p
            )
            easedNext.x.max = mix(
                this.next.layout.x.max,
                this.prev.layout.x.max,
                p
            )
            easedNext.y.min = mix(
                this.next.layout.y.min,
                this.prev.layout.y.min,
                p
            )
            easedNext.y.max = mix(
                this.next.layout.y.max,
                this.prev.layout.y.max,
                p
            )

            const appliedNext = applyTreeDeltas(parentDeltas, easedNext)
            const delta = calcBoxDelta(
                this.prev.layout,
                appliedNext,
                isRotationAnimating ? 0.5 : undefined
            )

            // TODO: Look into combining this into a single loop with applyTreeDeltas
            const treeScale = calcTreeScale(parentDeltas)

            // Update localDelta for children
            // TODO neaten this shit up
            this.delta.x.translate = delta.x.translate
            this.delta.x.scale = delta.x.scale
            this.delta.x.origin = delta.x.origin
            this.delta.x.originPoint = delta.x.originPoint
            this.delta.y.translate = delta.y.translate
            this.delta.y.scale = delta.y.scale
            this.delta.y.origin = delta.y.origin
            this.delta.y.originPoint = delta.y.originPoint

            nativeElement.setStyle({
                originX: delta.x.origin,
                originY: delta.y.origin,
            })

            const deltaXScale = delta.x.scale
            const deltaYScale = delta.y.scale

            values.get("scaleX", 1).set(deltaXScale)
            values.get("scaleY", 1).set(deltaYScale)

            // TODO We need to apply the whole stack of scales in the same way as border radius
            values.get("x", 1).set(this.delta.x.translate / treeScale.x)
            values.get("y", 1).set(this.delta.y.translate / treeScale.y)

            // TODO: Only do if we are animating rotate
            if (isRotationAnimating) {
                values
                    .get("rotate", 0)
                    .set(
                        mix(
                            this.prev.style.rotate as number,
                            this.next.style.rotate as number,
                            p
                        )
                    )
            }
            // TODO: Only do this if we're animating border radius or border radius doesnt equal 0
            const easedBorderRadius = mix(
                this.prev.style.borderRadius,
                this.next.style.borderRadius,
                p
            )
            const borderRadiusX = easedBorderRadius / deltaXScale / treeScale.x
            const borderRadiusY = easedBorderRadius / deltaYScale / treeScale.y
            const borderRadius = `${borderRadiusX}px / ${borderRadiusY}px`
            values.get("borderRadius", "").set(borderRadius)
            // values.get("borderBottomRightRadius", "").set(borderRadius)
            // values.get("borderTopLeftRadius", "").set(borderRadius)
            // values.get("borderTopRightRadius", "").set(borderRadius)
        }

        // TODO: Resolve transition from  `autoTransition` > `transition` > `SyncLayoutContext.transition`
        this.progress.set(0)
        this.progress.set(0) // Set twice to hard-reset velocity
        startAnimation("progress", this.progress, 100, transition || {})

        // TODO we might need a deeper solution than one parent deep
        const unsubscribeProgress = this.progress.onChange(() =>
            updateBoundingBoxes()
        )
        let unsubscribeParentProgress: () => void

        if (parentContext.autoParentProgress) {
            unsubscribeParentProgress = parentContext.autoParentProgress.onChange(
                () => updateBoundingBoxes()
            )
        }

        this.detachFromParentLayout = () => {
            unsubscribeProgress()
            unsubscribeParentProgress && unsubscribeParentProgress()
        }

        updateBoundingBoxes()
    }

    transitionStyle(prev: Style, next: Style) {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const { controls, values, transition = {} } = this.props

        for (let i = 0; i < numAnimatableStyles; i++) {
            const key = animatableStyles[i]
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

const zeroDelta: AxisDelta = {
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}
