import * as React from "react"
import { FunctionalProps } from "../functionality/types"
import { MagicContext } from "./MagicContext"
import { resetStyles } from "./utils"

export class Magic extends React.Component<FunctionalProps> {
    static contextType = MagicContext

    private unregisterFromMagicContext?: () => void

    depth: number

    isHidden = false

    prev: number = 0

    constructor(props: FunctionalProps) {
        super(props)
        this.depth = props.localContext.depth
    }

    componentDidMount() {
        if (!this.context) return

        this.unregisterFromMagicContext = this.context.register(this)
    }

    componentWillUnmount() {
        this.unregisterFromMagicContext && this.unregisterFromMagicContext()
    }

    resetRotation() {
        console.log("resetting rotation", this.props.id)
    }

    resetStyles() {
        const { values, nativeElement, style } = this.props

        if (this.isHidden) {
            values.get("opacity", 0).set(0)
        } else {
            nativeElement.setStyle(resetStyles(style))
            // TODO: When exiting calculate size for new element
            nativeElement.render()
        }
    }

    snapshot() {
        console.log("snapshotting", this.props.id)

        this.prev = this.prev + 1
    }

    snapshotNext() {
        console.log("snapshotting target", this.props.id)
    }

    startAnimation() {
        console.log("animating", this.props.id)
    }

    render() {
        return null
    }
}

//
// import { Snapshot, BoxDelta, Style, AxisDelta, BoxShadow, Box } from "./types"
// import { syncTree, flushTree, Session } from "../../utils/tree-sync"
// import {
//     snapshot,
//     applyTreeDeltas,
//     resetStyles,
//     numAnimatableStyles,
//     animatableStyles,
//     calcTreeScale,
//     resolve,
//     calcBoxDelta,
// } from "./utils"
// import { syncRenderSession } from "../../dom/sync-render-session"
// import { TargetAndTransition } from "../../types"
// import { motionValue } from "../../value"
// import { startAnimation } from "../../animation/utils/transitions"
// import { mix, mixColor } from "@popmotion/popcorn"
// import { complex } from "style-value-types"
// import { MagicContext } from './MagicContext'

// export class Magic extends React.Component<FunctionalProps> {
//     static contextType = MagicContext

//     hidden = false

//     prev: Snapshot
//     next: Snapshot

//     // Some values we need to keep track of separately from snapshots TODO: Why
//     prevRotate = 0
//     prevBorderRadius: number
//     prevBoxShadow: string

//     // TODO: Consider replacing this with individual progress values for each transform. We aren't
//     // animating these directly because they're being calculated every frame
//     progress = motionValue(0)

//     // TODO: Add comment to make sure its clear that this is mutative
//     delta: BoxDelta = {
//         x: { ...zeroDelta },
//         y: { ...zeroDelta },
//     }

//     detachFromParentLayout?: () => void
//     detachFromMagicMotion?: () => void
//     cancelTransition?: () => void

//     componentDidMount() {
//         if (!this.isSyncedTree()) return

//     }

//     componentDidUpdate() {
//         !this.isSyncedTree() && flushTree("transition")
//     }

//     /**
//      * Measure the current state of the DOM before it's updated, and schedule transition checks.
//      * The lack of this specific lifecycle event in hooks is why this component is a class.
//      */
//     getSnapshotBeforeUpdate() {
//         if (!this.isSyncedTree()) {
//             this.snapshot()
//             this.scheduleTransition(this.prev)
//         }
//         return null
//     }

//     componentWillUnmount() {
//         this.cancelTransition && this.cancelTransition()
//         this.magicContext && this.magicContext.remove()
//         this.detachFromParentLayout && this.detachFromParentLayout()
//     }

//     resetRotation() {
//         const { values, nativeElement } = this.props
//         const rotate = values.get("rotate")
//         if (!rotate) return

//         this.prevRotate = (rotate.get() as number) || 0

//         if (this.prevRotate) {
//             nativeElement.setStyle("rotate", 0)
//             nativeElement.render()
//         }
//     }

//     snapshot() {
//         const { nativeElement } = this.props

//         this.prev = snapshot(nativeElement)
//         this.prev.style.rotate = this.prevRotate

//         // We don't want to animate from the measured border radius, but from the currently animated one
//         if (this.prevBorderRadius !== undefined) {
//             this.prev.style.borderRadius = this.prevBorderRadius
//         }
//         if (this.prevBoxShadow !== undefined) {
//             this.prev.style.boxShadow = this.prevBoxShadow
//         }

//         return this.prev
//     }

//     isSyncedTree() {
//         return this.context !== null && this.context !== undefined
//     }

//     sync(id: string, depth: number, session: Session) {
//         const sync = this.isSyncedTree()
//             ? (this.context.syncTree as typeof syncTree)
//             : syncTree

//         return sync(id, depth, session)
//     }

//     scheduleTransition(prev?: Snapshot) {
//         if (prev) this.prev = prev

//         const { nativeElement, parentContext, localContext, style } = this.props
//         const isExiting = parentContext.exitProps?.isExiting
//         let animationDirection = 1

//         this.cancelTransition = this.sync(
//             "transition",
//             localContext.depth,
//             schedule => {
//                 schedule(() => {
//                     // TODO: Look into lifecycle order to see if its possible to outright stop transition from firing
//                     // or being scheduled if this.hidden
//                     if (this.hidden) {
//                         nativeElement.setStyle({ opacity: 0 })
//                         return
//                     }
//                     // If we're not coming from anywhere we don't need to reset any styles
//                     if (!prev) return

//                     // Write: Remove the `transform` prop so we can correctly read its new layout position,
//                     // and reset any styles present
//                     nativeElement.setStyle(
//                         resetStyles(style, isExiting && this.prev.layout)
//                     )
//                     nativeElement.render()
//                 })

//                 schedule(() => {
//                     if (this.hidden) return

//                     // TODO: if isExiting, get snapshot from parent MagicMove stack

//                     if (isExiting) {
//                         if (this.magicContext) {
//                             this.next = this.magicContext.getPreviousSnapshot()
//                             this.next.style.opacity = 1
//                             ;[this.prev.layout, this.next.layout] = [
//                                 this.next.layout,
//                                 this.prev.layout,
//                             ]
//                             animationDirection = -1
//                         }

//                         if (!this.next) {
//                             this.next = this.prev
//                         }

//                         // Perhaps need to swap this.prev and this.next here

//                         // TODO: If we arent a magicID and we're exiting,  use the old layout
//                         //this.next.layout = this.prev.layout
//                     } else {
//                         // Read: Take a new snapshot
//                         this.next = snapshot(nativeElement)
//                     }

//                     this.next.style.rotate = resolve(0, style && style.rotate)

//                     if (!this.prev) this.prev = this.next

//                     // Load our layout animation progress into context so children can subscribe
//                     // and update their layout accordingly.
//                     // TODO: We might want to split progress into x/y and it would be better to
//                     // find another way of scheduling this so we don't have to recalculate for every change,
//                     // or maybe split subscriptions and recalculations per axis
//                     localContext.autoParentProgress = this.progress

//                     // Create a delta stack for children to incorporate into their
//                     // own transform calculations
//                     localContext.deltas = [
//                         ...(parentContext.deltas || []),
//                         this.delta,
//                     ]
//                 })

//                 // Write: Apply deltas and animate
//                 schedule(() => {
//                     if (this.hidden) return
//                     syncRenderSession.open()

//                     const animations = [
//                         this.transitionLayout(animationDirection, !!prev),
//                     ]

//                     if (prev) {
//                         animations.push(
//                             this.transitionStyle(
//                                 this.prev.style,
//                                 this.next.style
//                             )
//                         )
//                     }

//                     Promise.all(animations).then(() => {
//                         if (parentContext.exitProps?.onExitComplete) {
//                             parentContext.exitProps?.onExitComplete()
//                         }

//                         // TODO: Check onAnimationComplete and see if this is the same
//                         if (this.props.onMagicComplete)
//                             this.props.onMagicComplete()
//                     })

//                     syncRenderSession.flush()
//                 })
//             }
//         )
//     }

//     transitionLayout(direction = 1, isTransition: boolean = true) {
//         let animation
//         this.detachFromParentLayout && this.detachFromParentLayout()

//         const { nativeElement, values, parentContext } = this.props
//         const prevStyle = this.prev.style
//         const nextStyle = this.next.style

//         const isAnimatingRotate = prevStyle.rotate !== nextStyle.rotate
//         const hasBorderRadius = prevStyle.borderRadius || nextStyle.borderRadius
//         const hasBoxShadow =
//             prevStyle.boxShadow !== "none" || nextStyle.boxShadow !== "none"

//         const target: Box = {
//             x: { min: 0, max: 0 },
//             y: { min: 0, max: 0 },
//         }

//         const x = values.get("x", 0)
//         const y = values.get("y", 0)
//         const scaleX = values.get("scaleX", 1)
//         const scaleY = values.get("scaleY", 1)
//         const rotate = values.get("rotate", 0)
//         const borderRadius = values.get("borderRadius", "")
//         const boxShadow = values.get("boxShadow", "")

//         let prevShadow: BoxShadow
//         let nextShadow: BoxShadow
//         let targetShadow: BoxShadow
//         let mixShadowColor: (p: number) => string
//         let shadowTemplate: (shadow: BoxShadow) => string

//         if (hasBoxShadow) {
//             prevShadow = getAnimatableShadow(
//                 prevStyle.boxShadow,
//                 nextStyle.boxShadow
//             )
//             nextShadow = getAnimatableShadow(
//                 nextStyle.boxShadow,
//                 prevStyle.boxShadow
//             )

//             targetShadow = [...prevShadow] as BoxShadow

//             mixShadowColor = mixColor(prevShadow[0], nextShadow[0])
//             shadowTemplate = complex.createTransformer(
//                 nextStyle.boxShadow !== "none"
//                     ? nextStyle.boxShadow
//                     : prevStyle.boxShadow
//             ) as (shadow: BoxShadow) => string
//         }

//         const updateBoundingBoxes = () => {
//             // TODO: DON'T BE WASTEFUL HERE - eliminate object creation as this function
//             // can potentially run multiple times per frame.
//             const parentDeltas = parentContext.deltas || []

//             // TODO: Clean this up
//             // Use the current progress value to interpolate between the previous and next
//             // bounding box before applying and calculating deltas.
//             const p = this.progress.get() / 1000

//             easeBox(target, this.prev, this.next, p)
//             applyTreeDeltas(target, parentDeltas)

//             calcBoxDelta(
//                 this.delta,
//                 this.prev.layout,
//                 target,
//                 prevStyle.rotate || nextStyle.rotate ? 0.5 : undefined
//             )

//             // TODO: Look into combining this into a single loop with applyTreeDeltas
//             const treeScale = calcTreeScale(parentDeltas)

//             nativeElement.setStyle("originX", this.delta.x.origin)
//             nativeElement.setStyle("originY", this.delta.y.origin)

//             const deltaXScale = this.delta.x.scale
//             const deltaYScale = this.delta.y.scale

//             scaleX.set(deltaXScale)
//             scaleY.set(deltaYScale)

//             x.set(this.delta.x.translate / treeScale.x)
//             y.set(this.delta.y.translate / treeScale.y)

//             if (isAnimatingRotate) {
//                 const targetRotate = mix(
//                     prevStyle.rotate as number,
//                     nextStyle.rotate as number,
//                     p
//                 )

//                 rotate.set(targetRotate)
//             }

//             if (hasBorderRadius) {
//                 this.prevBorderRadius = mix(
//                     prevStyle.borderRadius,
//                     nextStyle.borderRadius,
//                     p
//                 )
//                 const borderRadiusX =
//                     this.prevBorderRadius / deltaXScale / treeScale.x
//                 const borderRadiusY =
//                     this.prevBorderRadius / deltaYScale / treeScale.y
//                 borderRadius.set(`${borderRadiusX}px / ${borderRadiusY}px`)
//             }

//             if (hasBoxShadow) {
//                 // Update box shadow
//                 targetShadow[0] = mixShadowColor(p) // color
//                 targetShadow[1] = mix(prevShadow[1], nextShadow[1], p) // x
//                 targetShadow[2] = mix(prevShadow[2], nextShadow[2], p) // y
//                 targetShadow[3] = mix(prevShadow[3], nextShadow[3], p) // blur
//                 targetShadow[4] = mix(prevShadow[4], nextShadow[4], p) // spread

//                 // Update prev box shadow before FLIPPing
//                 this.prevBoxShadow = shadowTemplate(targetShadow)

//                 // Apply FLIP inversion to physical dimensions. We need to take an average scale for XY to apply
//                 // to blur and spread, which affect both axis equally.
//                 targetShadow[1] = targetShadow[1] / deltaXScale / treeScale.x // x
//                 targetShadow[2] = targetShadow[2] / deltaYScale / treeScale.y // y

//                 const averageXYScale = mix(deltaXScale, deltaYScale, 0.5)
//                 const averageTreeXTScale = mix(treeScale.x, treeScale.y, 0.5)
//                 targetShadow[3] =
//                     targetShadow[3] / averageXYScale / averageTreeXTScale // blur
//                 targetShadow[4] =
//                     targetShadow[4] / averageXYScale / averageTreeXTScale // spread

//                 boxShadow.set(shadowTemplate(targetShadow))
//             }
//         }

//         const from = direction === 1 ? 0 : 1000
//         this.progress.set(from)
//         this.progress.set(from) // Set twice to hard-reset velocity

//         if (isTransition) {
//             const { transition, magicTransition } = this.props
//             animation = startAnimation(
//                 "progress",
//                 this.progress,
//                 direction === 1 ? 1000 : 0,
//                 magicTransition || transition || {}
//             )
//         }

//         // TODO we might need a deeper solution than one parent deep
//         const unsubscribeProgress = this.progress.onChange(() =>
//             updateBoundingBoxes()
//         )
//         let unsubscribeParentProgress: () => void

//         if (parentContext.autoParentProgress) {
//             unsubscribeParentProgress = parentContext.autoParentProgress.onChange(
//                 () => updateBoundingBoxes()
//             )
//         }

//         this.detachFromParentLayout = () => {
//             unsubscribeProgress()
//             unsubscribeParentProgress && unsubscribeParentProgress()
//         }

//         updateBoundingBoxes()

//         return animation
//     }

//     transitionStyle(prev: Style, next: Style) {
//         let shouldTransitionStyle = false
//         const target: TargetAndTransition = {}
//         const {
//             controls,
//             values,
//             transition = {},
//             magicTransition,
//         } = this.props

//         for (let i = 0; i < numAnimatableStyles; i++) {
//             const key = animatableStyles[i]
//             const prevStyle = prev[key]
//             const nextStyle = next[key]

//             if (prevStyle !== nextStyle) {
//                 shouldTransitionStyle = true
//                 const value = values.get(key, prevStyle)
//                 value.set(prevStyle)
//                 target[key] = nextStyle
//             }
//         }

//         target.transition = magicTransition || transition

//         if (shouldTransitionStyle) {
//             return controls.start(target)
//         }
//     }

//     render() {
//         return null
//     }
// }

// const zeroDelta: AxisDelta = {
//     translate: 0,
//     scale: 1,
//     origin: 0,
//     originPoint: 0,
// }

// function easeAxis(
//     axis: "x" | "y",
//     target: Box,
//     prev: Snapshot,
//     next: Snapshot,
//     p: number
// ) {
//     target[axis].min = mix(next.layout[axis].min, prev.layout[axis].min, p)
//     target[axis].max = mix(next.layout[axis].max, prev.layout[axis].max, p)
// }

// function easeBox(target: Box, prev: Snapshot, next: Snapshot, p: number) {
//     easeAxis("x", target, prev, next, p)
//     easeAxis("y", target, prev, next, p)
// }

// function getAnimatableShadow(shadow: string, fallback: string) {
//     if (shadow === "none") {
//         shadow = complex.getAnimatableNone(fallback)
//     }

//     return complex.parse(shadow) as BoxShadow
// }
