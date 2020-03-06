import * as React from "react"
import { MagicMotionContext, MagicMotionChild } from "./MagicMotion"
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
 * - Individual border radius
 * - Fix `AnimatePresence` children scale calculation (see: autoExampleExpandingCTA)
 * - Box shadows
 * - Integrate with `AnimatePresence` so we can do container-style transitions
 * - Allow `magic` to === `false`? Either as a callback or a prop
 * - Documentation
 * - Flickering when entering component animates with opacity
 * - When a component isExiting, `next` should probably just be `prev` or zero delta
 * - Currently changes to the parent bounding box translation don't affect children.
 *      The children should move relative to the parent (see: autoParentLayout)
 * - Allow magic === "layout" || "style" || true
 * - Wire up onAnimationComplete
 */

export class Magic extends React.Component<FunctionalProps> {
    static contextType = MagicMotionContext

    prev: Snapshot
    next: Snapshot

    prevRotate = 0
    prevBorderRadius: number

    // TODO: Consider replacing this with individual progress values for each transform. We aren't
    // animating these directly because they're being calculated every frame
    progress = motionValue(0)

    // TODO: Add comment to make sure its clear that this is mutative
    delta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }

    detachFromParentLayout?: () => void
    detachFromMagicMotion?: () => void
    cancelTransition?: () => void

    componentDidMount() {
        if (!this.isSyncedTree()) return

        const { magicId } = this.props
        const { register } = this.context

        let syncLayoutChild: MagicMotionChild = {
            snapshot: () => {
                const prev = this.snapshot()
                this.scheduleTransition(this.prev)
                return prev
            },
            resetRotation: () => this.resetRotation(),
            id: magicId,
            resume: (prev?: Snapshot) => this.scheduleTransition(prev),
        }

        this.detachFromMagicMotion = register(syncLayoutChild)
    }

    componentDidUpdate() {
        !this.isSyncedTree() && flushTree("transition")
    }

    /**
     * Measure the current state of the DOM before it's updated, and schedule transition checks.
     * The lack of this specific lifecycle event in hooks is why this component is a class.
     */
    getSnapshotBeforeUpdate() {
        if (!this.isSyncedTree()) {
            this.snapshot()
            this.scheduleTransition(this.prev)
        }
        return null
    }

    componentWillUnmount() {
        this.cancelTransition && this.cancelTransition()
        this.detachFromMagicMotion && this.detachFromMagicMotion()
        this.detachFromParentLayout && this.detachFromParentLayout()
    }

    resetRotation() {
        const { values, nativeElement } = this.props
        const rotate = values.get("rotate")

        if (!rotate) return

        this.prevRotate = (rotate.getPrevious() as number) || 0

        if (this.prevRotate) {
            nativeElement.setStyle("rotate", 0)
            nativeElement.render()
        }
    }

    snapshot() {
        const { nativeElement } = this.props

        this.prev = snapshot(nativeElement)
        this.prev.style.rotate = this.prevRotate
        if (this.prevBorderRadius !== undefined) {
            this.prev.style.borderRadius = this.prevBorderRadius
        }

        return this.prev
    }

    isSyncedTree() {
        return this.context !== null && this.context !== undefined
    }

    sync(id: string, depth: number, session: Session) {
        const sync = this.isSyncedTree()
            ? (this.context.syncTree as typeof syncTree)
            : syncTree

        return sync(id, depth, session)
    }

    scheduleTransition(prev?: Snapshot) {
        // Assign incoming prev to this.prev in case it's being provided by MagicMotion's continuity
        if (prev) {
            this.prev = prev
        }
        console.trace()
        const { nativeElement, parentContext, localContext, style } = this.props
        const isExiting = parentContext.exitProps?.isExiting

        this.cancelTransition = this.sync(
            "transition",
            localContext.depth,
            schedule => {
                schedule(() => {
                    // If we're not coming from anywhere we don't need to reset any styles
                    if (!prev) return

                    // Write: Remove the `transform` prop so we can correctly read its new layout position,
                    // and reset any styles present
                    nativeElement.setStyle(resetStyles(style, isExiting))
                    nativeElement.render()
                })

                schedule(() => {
                    // Read: Take a new snapshot
                    this.next = snapshot(nativeElement)

                    if (isExiting) {
                        this.next.layout = this.prev.layout
                    }
                    this.next.style.rotate = resolve(0, style && style.rotate)

                    if (!this.prev) this.prev = this.next

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

                    this.transitionLayout(!!prev && !isExiting)

                    if (prev) {
                        this.transitionStyle(this.prev.style, this.next.style)
                    }

                    syncRenderSession.flush()
                })
            }
        )
    }

    transitionLayout(isTransition: boolean = true) {
        const { nativeElement, values, parentContext, transition } = this.props
        const isRotationAnimating =
            this.prev.style.rotate !== this.next.style.rotate
        this.detachFromParentLayout && this.detachFromParentLayout()

        if (this.props.id === "content-2") {
            console.log(this.prev.layout.y, this.next.layout.y)
            console.log(nativeElement.getBoundingBox())
        }
        const updateBoundingBoxes = () => {
            // TODO: DON'T BE WASTEFUL HERE - eliminate object creation as this function
            // can potentially run multiple times per frame.
            const parentDeltas = parentContext.deltas || []

            // TODO: Clean this up
            // Use the current progress value to interpolate between the previous and next
            // bounding box before applying and calculating deltas.
            const p = this.progress.get() / 1000
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
            values.get("x", 1).set(delta.x.translate / treeScale.x)
            values.get("y", 1).set(delta.y.translate / treeScale.y)

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
            this.prevBorderRadius = mix(
                this.prev.style.borderRadius,
                this.next.style.borderRadius,
                p
            )
            const borderRadiusX =
                this.prevBorderRadius / deltaXScale / treeScale.x
            const borderRadiusY =
                this.prevBorderRadius / deltaYScale / treeScale.y
            const borderRadius = `${borderRadiusX}px / ${borderRadiusY}px`
            values.get("borderRadius", "").set(borderRadius)
            // values.get("borderBottomRightRadius", "").set(borderRadius)
            // values.get("borderTopLeftRadius", "").set(borderRadius)
            // values.get("borderTopRightRadius", "").set(borderRadius)
        }

        // TODO: Resolve transition from  `autoTransition` > `transition` > `MagicMotionContext.transition`
        this.progress.set(0)
        this.progress.set(0) // Set twice to hard-reset velocity

        if (this.props.id === "content-1") {
            console.log(isTransition)
        }
        if (isTransition) {
            startAnimation("progress", this.progress, 1000, transition || {})
        }

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
                //transition[key] = {}
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
