import * as React from "react"
import { SyncLayoutContext, SyncLayoutChild } from "../../components/SyncLayout"
import { FunctionalProps } from "../functionality/types"
import { Snapshot, BoxDelta, Style, AxisDelta } from "./types"
import { syncTree, flushTree } from "../../utils/tree-sync"
import {
    snapshot,
    calcBoxDelta,
    applyTreeDeltas,
    resetStyles,
    numAnimatableStyles,
    animatableStyles,
} from "./utils"
import { syncRenderSession } from "../../dom/sync-render-session"
import { TargetAndTransition, Transition } from "../../types"
import { motionValue } from "../../value"
import { startAnimation } from "../../animation/utils/transitions"
import { mix } from "@popmotion/popcorn"

const autoKey = "auto"
//const subId = Symbol(autoKey)

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

    progress = motionValue(0)

    // TODO: Add comment to make sure its clear that this is mutative
    delta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }

    detachLayout?: () => void
    removeFromSyncedTree?: () => void

    componentDidMount() {
        if (!this.isSyncedTree()) return

        const { autoId } = this.props
        const { register } = this.context

        let syncLayoutChild: SyncLayoutChild = {
            snapshot: () => {
                // TODO This could be consolidated with getSnapshot
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

        this.removeFromSyncedTree = register(syncLayoutChild)
    }

    componentDidUpdate() {
        !this.isSyncedTree() && flushTree(autoKey)
    }

    /**
     * Measure the current state of the DOM before it's updated, and schedule transition checks.
     * The lack of this specific lifecycle event in hooks is why this component is a class.
     */
    getSnapshotBeforeUpdate() {
        if (!this.isSyncedTree()) {
            this.snapshot()
            this.scheduleTransition()
        }
        return null
    }

    componentWillUnmount() {
        this.removeFromSyncedTree && this.removeFromSyncedTree()
    }

    snapshot() {
        const { nativeElement } = this.props
        this.prev = snapshot(nativeElement)
        return this.prev
    }

    isSyncedTree() {
        return this.context !== null && this.context !== undefined
    }

    scheduleTransition(prev = this.prev) {
        const { nativeElement, parentContext, localContext, style } = this.props

        // Assign incoming prev to this.prev in case it's being provided by SyncLayout's continuity
        this.prev = prev

        const sync = this.isSyncedTree()
            ? (this.context.syncTree as typeof syncTree)
            : syncTree

        sync(autoKey, (up, down) => {
            up(() => {
                // Write: Remove the `transform` prop so we can correctly read its new layout position,
                // and reset any styles present
                nativeElement.setStyle(resetStyles(style))
                nativeElement.render()
            })

            down(() => {
                // Read: Take a new snapshot
                this.next = snapshot(nativeElement)

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
            down(() => {
                syncRenderSession.open()

                this.transitionLayout()
                this.transitionStyle(prev.style, this.next.style)

                syncRenderSession.flush()
            })
        })
    }

    transitionLayout() {
        const { nativeElement, values, parentContext } = this.props

        this.detachLayout && this.detachLayout()

        const updateBoundingBoxes = () => {
            // TODO: DON'T BE WASTEFUL HERE - eliminate object creation as this function
            // can potentially run multiple times per frame.

            const parentDeltas = parentContext.deltas || []

            // TODO: Clean this up
            // Use the current progress value to interpolate between the previous and next
            // bounding box before applying and calculating deltas.
            const p = this.progress.get()
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
            const delta = calcBoxDelta(this.prev.layout, appliedNext)

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

            const parentDelta = parentDeltas[parentDeltas.length - 1]
            const parentScaleX = parentDelta ? parentDelta.x.scale : 1
            const parentScaleY = parentDelta ? parentDelta.y.scale : 1
            values.get("scaleX", 1).set(this.delta.x.scale)
            values.get("scaleY", 1).set(this.delta.y.scale)

            // TODO We need to apply the whole stack of scales in the same way as border radius
            values.get("x", 1).set(this.delta.x.translate / parentScaleX)
            values.get("y", 1).set(this.delta.y.translate / parentScaleY)

            // TODO: Replace this with a solution that uses applyBoxDelta to transform
            // all border radius throughout the tree
            const borderRadius = `${this.next.style.borderRadius /
                this.delta.x.scale /
                parentScaleX}px ${this.next.style.borderRadius /
                this.delta.y.scale /
                parentScaleY}px`
            values.get("borderBottomLeftRadius", "").set(borderRadius)
            values.get("borderBottomRightRadius", "").set(borderRadius)
            values.get("borderTopLeftRadius", "").set(borderRadius)
            values.get("borderTopRightRadius", "").set(borderRadius)
        }

        // TODO: Resolve transition from  `autoTransition` > `transition` > `SyncLayoutContext.transition`
        this.progress.set(0)
        startAnimation("progress", this.progress, 1, {
            duration: 2,
            ease: "circIn",
        })

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

        this.detachLayout = () => {
            unsubscribeProgress()
            unsubscribeParentProgress && unsubscribeParentProgress()
        }

        updateBoundingBoxes()
    }

    transitionStyle(prev: Style, next: Style) {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const transition: Transition = {}
        const { controls, values } = this.props

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
