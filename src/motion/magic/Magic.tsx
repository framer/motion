import * as React from "react"
import { useContext } from "react"
import { FunctionalProps } from "../functionality/types"
import { MagicContext } from "./MagicContext"
import {
    resetStyles,
    snapshot,
    applyCurrent,
    resolve,
    numAnimatableStyles,
    animatableStyles,
    easeBox,
    applyTreeDeltas,
    calcBoxDelta,
    calcTreeScale,
} from "./utils"
import {
    Snapshot,
    Style,
    BoxDelta,
    Box,
    BoxShadow,
    MagicControlledTree,
    MagicBatchTree,
    Axis,
} from "./types"
import { MotionValue } from "../../value"
import { syncRenderSession } from "../../dom/sync-render-session"
import { TargetAndTransition } from "../../types"
import { startAnimation } from "../../animation/utils/transitions"
import { mix, mixColor } from "@popmotion/popcorn"
import { complex } from "style-value-types"
import { usePresence } from "../../components/AnimatePresence/use-presence"
export { MagicControlledTree, MagicBatchTree }

/**
 * Magic Motion relies on multiple components and class components only support, hence this
 * wrapper component that provides those contexts as props.
 */
export const MagicContextProvider = (props: FunctionalProps) => {
    const [isPresent, safeToRemove] = usePresence()
    const magicContext = useContext(MagicContext)

    return (
        <Magic
            {...props}
            isPresent={isPresent}
            safeToRemove={safeToRemove}
            magicContext={magicContext}
        />
    )
}

interface ContextProps {
    isPresent: boolean
    safeToRemove?: () => void
    magicContext: MagicControlledTree | MagicBatchTree
}

export class Magic extends React.Component<FunctionalProps & ContextProps> {
    private unregisterFromMagicContext?: () => void
    private stopLayoutAnimation?: () => void

    private shouldTransition = true

    depth: number

    isHidden = false

    prev: Snapshot
    actual: Snapshot
    next: Snapshot
    correctedLayout: Box = {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
    }

    progress: MotionValue<number>

    // TODO: Add comment to make sure its clear that this is mutative
    delta: BoxDelta

    target: Box

    treeScale: {
        x: number
        y: number
    }

    current: Partial<Style> = {
        rotate: 0,
    }

    prevRotate = 0

    constructor(props: FunctionalProps & ContextProps) {
        super(props)
        this.depth = props.localContext.depth
        this.progress = props.localContext.magicProgress as MotionValue<number>
        this.delta = props.localContext.magicDelta as BoxDelta
    }

    componentDidMount() {
        const { magicContext } = this.props

        if (isControlledTree(magicContext)) {
            this.unregisterFromMagicContext = magicContext.register(this)
        } else {
            this.getSnapshotBeforeUpdate = () => {
                this.snapshot()
                magicContext.add(this)
                return null
            }

            this.componentDidUpdate = () => magicContext.flush()
        }
    }

    componentWillUnmount() {
        this.unregisterFromMagicContext && this.unregisterFromMagicContext()
        this.stopLayoutAnimation && this.stopLayoutAnimation()
    }

    shouldComponentUpdate(nextProps: FunctionalProps & ContextProps) {
        const hasDependency =
            this.props.magicDependency !== undefined ||
            nextProps.magicDependency !== undefined
        const dependencyHasChanged =
            this.props.magicDependency !== nextProps.magicDependency
        const presenceHasChanged = this.props.isPresent !== nextProps.isPresent

        this.shouldTransition =
            !hasDependency ||
            (hasDependency && dependencyHasChanged) ||
            presenceHasChanged

        return true
    }

    resetRotation() {
        const { nativeElement, values } = this.props
        const rotate = values.get("rotate")
        this.current.rotate = rotate ? (rotate.get() as number) : 0

        if (!this.current.rotate) return

        nativeElement.setStyle("rotate", 0)
        nativeElement.render()
    }

    resetStyles() {
        const { nativeElement, style, values, animate } = this.props

        const reset = resetStyles(style, animate)

        if (this.isHidden) {
            reset.opacity = 0
            values.get("opacity")?.set(0)
        }

        nativeElement.setStyle(reset)
        // TODO: When exiting calculate size for new element
        nativeElement.render()
    }

    snapshot() {
        const { nativeElement } = this.props
        const prev = snapshot(nativeElement)
        applyCurrent(prev.style, this.current)

        if (this.isHidden) prev.style.opacity = 1

        this.prev = prev
    }

    snapshotNext() {
        const { nativeElement, style } = this.props

        const actual = snapshot(nativeElement)
        actual.style.rotate = resolve(0, style && style.rotate)
        this.actual = actual
    }

    hide() {
        this.isHidden = true
    }

    show() {
        this.isHidden = false
    }

    startAnimation(next?: Snapshot) {
        if (!this.shouldTransition) return

        syncRenderSession.open()

        if (!this.isPresent() && this.props.magicId === undefined) {
            this.safeToRemove()
        }

        this.next = next || this.actual

        if (!this.prev) this.prev = this.next
        // If we're animating to an external target, copy its styles
        // straight to the `next` target
        if (next) this.next.style = next.style

        const animations = [
            this.startLayoutAnimation(),
            this.startStyleAnimation(),
        ]

        Promise.all(animations.filter(Boolean)).then(() => {
            const { onMagicComplete } = this.props
            onMagicComplete && onMagicComplete()

            !this.isPresent() && this.safeToRemove()
        })

        syncRenderSession.flush()
    }

    /**
     * This uses the FLIP animation technique to animate physical dimensions
     * and correct distortion on related styles (ie borderRadius etc)
     */
    startLayoutAnimation() {
        let animation

        this.stopLayoutAnimation && this.stopLayoutAnimation()

        const prevStyle = this.prev.style
        const nextStyle = this.next.style
        const isAnimatingRotate = prevStyle.rotate !== nextStyle.rotate

        const hasBorderTopLeftRadius =
            prevStyle.borderTopLeftRadius || nextStyle.borderTopLeftRadius
        const hasBorderTopRightRadius =
            prevStyle.borderTopRightRadius || nextStyle.borderTopRightRadius
        const hasBorderBottomLeftRadius =
            prevStyle.borderBottomLeftRadius || nextStyle.borderBottomLeftRadius
        const hasBorderBottomRightRadius =
            prevStyle.borderBottomRightRadius ||
            nextStyle.borderBottomRightRadius

        const hasBoxShadow =
            prevStyle.boxShadow !== "none" || nextStyle.boxShadow !== "none"
        const updateBoxShadow =
            hasBoxShadow &&
            this.createUpdateBoxShadow(prevStyle.boxShadow, nextStyle.boxShadow)

        this.target = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }

        const { values } = this.props
        const x = values.get("x", 0)
        const y = values.get("y", 0)
        const scaleX = values.get("scaleX", 1)
        const scaleY = values.get("scaleY", 1)
        const rotate = values.get("rotate", 0)

        const borderTopLeftRadius = values.get("borderTopLeftRadius", "")
        const borderTopRightRadius = values.get("borderTopRightRadius", "")
        const borderBottomLeftRadius = values.get("borderBottomLeftRadius", "")
        const borderBottomRightRadius = values.get(
            "borderBottomRightRadius",
            ""
        )

        const frame = () => {
            // TODO: Break up each of these so we can animate separately
            const p = this.progress.get() / 1000
            this.updateBoundingBox(p, isAnimatingRotate ? 0.5 : undefined)
            this.updateTransform(x, y, scaleX, scaleY)

            isAnimatingRotate && this.updateRotate(p, rotate)

            hasBorderTopLeftRadius &&
                this.updateBorderRadius(
                    p,
                    borderTopLeftRadius,
                    "borderTopLeftRadius"
                )
            hasBorderTopRightRadius &&
                this.updateBorderRadius(
                    p,
                    borderTopRightRadius,
                    "borderTopRightRadius"
                )
            hasBorderBottomLeftRadius &&
                this.updateBorderRadius(
                    p,
                    borderBottomLeftRadius,
                    "borderBottomLeftRadius"
                )
            hasBorderBottomRightRadius &&
                this.updateBorderRadius(
                    p,
                    borderBottomRightRadius,
                    "borderBottomRightRadius"
                )

            updateBoxShadow && updateBoxShadow(p)
        }

        const progressOrigin = 0
        const progressTarget = 1000

        this.progress.set(progressOrigin)
        this.progress.set(progressOrigin) // Set twice to hard-reset velocity

        const { magicTransition, transition } = this.props
        animation = startAnimation("progress", this.progress, progressTarget, {
            ...(magicTransition || transition),
            restDelta: 1,
            restSpeed: 10,
        })

        // TODO: We're currently chaining just the parent and child deep, and if both
        // update then `frame` fires twice in a frame. This only leads to one render
        // but it'd be cooler if it batched updates
        const { parentContext } = this.props
        const { magicProgress } = parentContext
        const unsubscribeProgress = this.progress.onChange(frame)
        let unsubscribeParentProgress: () => void
        if (magicProgress) {
            unsubscribeParentProgress = magicProgress.onChange(frame)
        }

        this.stopLayoutAnimation = () => {
            this.progress.stop()
            unsubscribeProgress()
            unsubscribeParentProgress && unsubscribeParentProgress()
        }

        frame()

        return animation
    }

    /**
     * This is a straight animation between prev/next styles. This animates
     * styles that don't need scale inversion correction.
     */
    startStyleAnimation() {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const { values } = this.props

        for (let i = 0; i < numAnimatableStyles; i++) {
            const key = animatableStyles[i]
            const prevStyle = this.prev.style[key]
            const nextStyle = this.next.style[key]

            if (prevStyle !== nextStyle) {
                shouldTransitionStyle = true
                const value = values.get(key, prevStyle)
                value.set(prevStyle)

                target[key] = nextStyle
            }
        }

        const { magicTransition, transition, controls } = this.props
        target.transition = magicTransition || transition || {}

        if (shouldTransitionStyle) {
            return controls.start(target)
        }
    }

    updateBoundingBox(p: number, origin?: number) {
        const { parentContext } = this.props
        const parentDeltas = parentContext.magicDeltas || []

        resetLayout(this.correctedLayout, this.actual.layout)
        applyTreeDeltas(this.correctedLayout, parentDeltas)
        easeBox(this.target, this.prev.layout, this.next.layout, p)
        calcBoxDelta(this.delta, this.target, this.correctedLayout, origin)

        // TODO: If we could return this from applyTreeDeltas
        // it'd save a second loop
        // TODO: Dont create a new object here
        this.treeScale = calcTreeScale(parentDeltas)
    }

    updateTransform(
        x: MotionValue<number>,
        y: MotionValue<number>,
        scaleX: MotionValue<number>,
        scaleY: MotionValue<number>
    ) {
        const { nativeElement } = this.props
        const dx = this.delta.x
        const dy = this.delta.y

        nativeElement.setStyle("originX", dx.origin)
        nativeElement.setStyle("originY", dy.origin)

        x.set(dx.translate / this.treeScale.x)
        y.set(dy.translate / this.treeScale.y)
        scaleX.set(dx.scale)
        scaleY.set(dy.scale)
    }

    updateRotate(p: number, rotate: MotionValue<number>) {
        const target = mix(
            this.prev.style.rotate as number,
            this.next.style.rotate as number,
            p
        )
        rotate.set(target)
    }

    updateBorderRadius(
        p: number,
        borderRadius: MotionValue<string>,
        property: string
    ) {
        const target = mix(
            this.prev.style[property],
            this.next.style[property],
            p
        )

        this.current[property] = target

        const targetX = target / this.delta.x.scale / this.treeScale.x
        const targetY = target / this.delta.y.scale / this.treeScale.y

        borderRadius.set(`${targetX}px ${targetY}px`)
    }

    createUpdateBoxShadow(prev: string, next: string) {
        const prevShadow = getAnimatableShadow(prev, next)
        const nextShadow = getAnimatableShadow(next, prev)

        const targetShadow = [...prevShadow] as BoxShadow
        const mixShadowColor = mixColor(prevShadow[0], nextShadow[0])

        const shadowTemplate = complex.createTransformer(
            next !== "none" ? next : prev
        ) as (shadow: BoxShadow) => string

        const dx = this.delta.x
        const dy = this.delta.y

        const { values } = this.props
        const boxShadow = values.get("boxShadow", "")

        return (p: number) => {
            // Update box shadow
            targetShadow[0] = mixShadowColor(p) // color
            targetShadow[1] = mix(prevShadow[1], nextShadow[1], p) // x
            targetShadow[2] = mix(prevShadow[2], nextShadow[2], p) // y
            targetShadow[3] = mix(prevShadow[3], nextShadow[3], p) // blur
            targetShadow[4] = mix(prevShadow[4], nextShadow[4], p) // spread

            // Update prev box shadow before FLIPPing
            this.current.boxShadow = shadowTemplate(targetShadow)

            // Apply FLIP inversion to physical dimensions. We need to take an average scale for XY to apply
            // to blur and spread, which affect both axis equally.
            targetShadow[1] = targetShadow[1] / dx.scale / this.treeScale.x
            targetShadow[2] = targetShadow[2] / dy.scale / this.treeScale.y

            const averageXYScale = mix(dx.scale, dy.scale, 0.5)
            const averageTreeXTScale = mix(
                this.treeScale.x,
                this.treeScale.y,
                0.5
            )
            targetShadow[3] =
                targetShadow[3] / averageXYScale / averageTreeXTScale // blur
            targetShadow[4] =
                targetShadow[4] / averageXYScale / averageTreeXTScale // spread

            boxShadow.set(shadowTemplate(targetShadow))
        }
    }

    isPresent() {
        return this.props.isPresent
    }

    safeToRemove() {
        const { safeToRemove } = this.props
        safeToRemove && safeToRemove()
    }

    render() {
        return null
    }
}

function getAnimatableShadow(shadow: string, fallback: string) {
    if (shadow === "none") {
        shadow = complex.getAnimatableNone(fallback)
    }

    return complex.parse(shadow) as BoxShadow
}

function isControlledTree(
    context: MagicControlledTree | MagicBatchTree
): context is MagicControlledTree {
    return !!(context as MagicControlledTree).register
}

function resetAxis(axis: Axis, originAxis: Axis) {
    axis.min = originAxis.min
    axis.max = originAxis.max
}

function resetLayout(box: Box, originBox: Box) {
    resetAxis(box.x, originBox.x)
    resetAxis(box.y, originBox.y)
}
