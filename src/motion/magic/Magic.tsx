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
    MagicAnimationOptions,
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

    measuredOrigin: Snapshot
    measuredTarget: Snapshot
    visualOrigin: Snapshot
    visualTarget: Snapshot

    hasAnimatedRotate: boolean = false

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
                this.snapshotOrigin()
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
        const { animate, nativeElement, style = {}, values } = this.props
        const reset = resetStyles(style)

        // If we're animating opacity separately, we don't want to reset
        // as it causes a visual flicker when adding the component
        // TODO: We should do this universally for all animating props
        // and account for variants too.
        if (typeof animate === "object" && animate.hasOwnProperty("opacity")) {
            delete reset.opacity
        } else if (this.isHidden) {
            reset.opacity = 0
            values.get("opacity")?.set(0)
        }

        nativeElement.setStyle(reset)
        nativeElement.render()
    }

    snapshotOrigin() {
        const { nativeElement } = this.props
        const origin = snapshot(nativeElement)
        applyCurrent(origin.style, this.current)

        if (this.isHidden) origin.style.opacity = 1

        this.measuredOrigin = origin
    }

    snapshotTarget() {
        const { nativeElement, style } = this.props

        const target = snapshot(nativeElement)
        target.style.rotate = resolve(0, style && style.rotate)
        this.measuredTarget = target
    }

    hide() {
        this.isHidden = true
    }

    show() {
        this.isHidden = false
    }

    startAnimation({ origin, target, ...opts }: MagicAnimationOptions = {}) {
        const { nativeElement, values } = this.props
        const rotate = values.get("rotate")
        rotate && nativeElement.setStyle("rotate", rotate.get())

        if (!this.shouldTransition) return

        syncRenderSession.open()

        if (!this.isPresent() && this.props.magicId === undefined) {
            this.safeToRemove()
        }

        this.visualTarget = target || this.measuredTarget
        this.visualOrigin = origin || this.measuredOrigin || this.visualTarget

        if (this.visualOrigin && this.visualTarget) {
            const animations = [
                this.startLayoutAnimation(opts),
                this.startStyleAnimation(opts),
            ]

            Promise.all(animations.filter(Boolean)).then(() => {
                const { onMagicComplete } = this.props
                onMagicComplete && onMagicComplete()

                !this.isPresent() && this.safeToRemove()
            })
        }

        syncRenderSession.flush()
    }

    /**
     * This uses the FLIP animation technique to animate physical dimensions
     * and correct distortion on related styles (ie borderRadius etc)
     */
    startLayoutAnimation(opts: MagicAnimationOptions) {
        let animation

        this.stopLayoutAnimation && this.stopLayoutAnimation()

        const originStyle = this.visualOrigin.style
        const targetStyle = this.visualTarget.style
        const isAnimatingRotate = originStyle.rotate !== targetStyle.rotate

        const hasBorderTopLeftRadius =
            originStyle.borderTopLeftRadius || targetStyle.borderTopLeftRadius
        const hasBorderTopRightRadius =
            originStyle.borderTopRightRadius || targetStyle.borderTopRightRadius
        const hasBorderBottomLeftRadius =
            originStyle.borderBottomLeftRadius ||
            targetStyle.borderBottomLeftRadius
        const hasBorderBottomRightRadius =
            originStyle.borderBottomRightRadius ||
            targetStyle.borderBottomRightRadius

        const hasBoxShadow =
            originStyle.boxShadow !== "none" || targetStyle.boxShadow !== "none"
        const updateBoxShadow =
            hasBoxShadow &&
            this.createUpdateBoxShadow(
                originStyle.boxShadow,
                targetStyle.boxShadow
            )

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
            this.updateBoundingBox(p, rotate.get() !== 0 ? 0.5 : undefined)
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

        const { magicTransition, transition, magic } = this.props

        if (magic !== false) {
            animation = startAnimation(
                "progress",
                this.progress,
                progressTarget,
                {
                    ...(opts.transition || magicTransition || transition),
                    restDelta: 1,
                    restSpeed: 10,
                }
            )
        }

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
    startStyleAnimation(opts: MagicAnimationOptions) {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const { values } = this.props

        for (let i = 0; i < numAnimatableStyles; i++) {
            const key = animatableStyles[i]
            const originStyle = this.visualOrigin.style[key]
            const nextStyle = this.visualTarget.style[key]

            if (originStyle !== nextStyle) {
                shouldTransitionStyle = true
                const value = values.get(key, originStyle)
                value.set(originStyle)

                target[key] = nextStyle
            }
        }

        const { magicTransition, transition, controls } = this.props
        target.transition =
            opts.transition || magicTransition || transition || {}

        if (opts.opacityEasing) {
            target.transition = {
                opacity: {
                    ...target.transition,
                    type: "tween",
                    ease: opts.opacityEasing,
                },
                default: { ...target.transition },
            }
        }

        if (shouldTransitionStyle) {
            return controls.start(target)
        }
    }

    updateBoundingBox(p: number, origin?: number) {
        const { parentContext } = this.props
        const parentDeltas = parentContext.magicDeltas || []

        resetLayout(this.correctedLayout, this.measuredTarget.layout)
        applyTreeDeltas(this.correctedLayout, parentDeltas)
        easeBox(
            this.target,
            this.visualOrigin.layout,
            this.visualTarget.layout,
            p
        )
        calcBoxDelta(this.delta, this.target, this.correctedLayout, origin)

        // TODO: If we could return this from applyTreeDeltas
        // it'd save a second loop
        // TODO: Dont create a new object here
        this.treeScale = calcTreeScale(parentDeltas)

        console.log(this.delta.y.translate)
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
            this.visualOrigin.style.rotate as number,
            this.visualTarget.style.rotate as number,
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
            this.visualOrigin.style[property],
            this.visualTarget.style[property],
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
