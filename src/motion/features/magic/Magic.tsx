import * as React from "react"
import { useContext } from "react"
import { FeatureProps } from "../types"
import { SharedLayoutContext } from "./SharedLayoutContext"
import {
    resetStyles,
    snapshot,
    applyCurrent,
    resolve,
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
    SharedLayoutTree,
    MagicBatchTree,
    Axis,
    AutoAnimationConfig,
} from "./types"
import { MotionValue } from "../../../value"
import { syncRenderSession } from "../../../dom/sync-render-session"
import { TargetAndTransition, Point } from "../../../types"
import { startAnimation } from "../../../animation/utils/transitions"
import { mix } from "@popmotion/popcorn"
import {
    usePresence,
    SafeToRemove,
} from "../../../components/AnimatePresence/use-presence"
import { defaultMagicValues, MagicValueHandlers } from "./values"
import { MotionPluginContext } from "../../context/MotionPluginContext"
export { SharedLayoutTree, MagicBatchTree }

/**
 * Magic Motion relies on multiple components and class components only support, hence this
 * wrapper component that provides those contexts as props.
 */
export const SharedLayoutContextProvider = (props: FeatureProps) => {
    const [isPresent, safeToRemove] = usePresence()
    const magicContext = useContext(SharedLayoutContext)
    const { magicValues, transformPagePoint } = useContext(MotionPluginContext)

    return (
        <Magic
            {...props}
            isPresent={isPresent}
            safeToRemove={safeToRemove}
            magicContext={magicContext}
            magicValues={magicValues}
            transformPagePoint={transformPagePoint}
        />
    )
}

interface ContextProps {
    isPresent: boolean
    safeToRemove?: null | SafeToRemove
    magicContext: SharedLayoutTree | MagicBatchTree
    magicValues: MagicValueHandlers
    transformPagePoint: (point: Point) => Point
}

export class Magic extends React.Component<FeatureProps & ContextProps> {
    private unregisterFromSharedLayoutContext?: () => void
    private stopLayoutAnimation?: () => void

    private shouldTransition = true

    private supportedMagicValues: MagicValueHandlers
    private animatableStyles: string[]

    shouldResumeFromPrevious = false
    shouldRestoreVisibility = false

    depth: number

    isVisible = true

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

    treeScale = { x: 1, y: 1 }

    current: Partial<Style> = {
        rotate: 0,
    }

    prevRotate = 0

    constructor(props: FeatureProps & ContextProps) {
        super(props)
        this.delta = props.localContext.magicDelta as BoxDelta
        this.depth = props.localContext.magicDepth
        this.progress = props.localContext.magicProgress as MotionValue<number>

        const { magicValues } = props
        this.supportedMagicValues = {
            ...defaultMagicValues,
            ...magicValues,
        }
        this.animatableStyles = []
        for (const key in this.supportedMagicValues) {
            if (!this.supportedMagicValues[key].createUpdater) {
                this.animatableStyles.push(key)
            }
        }
    }

    componentDidMount() {
        const { magicContext } = this.props

        if (isControlledTree(magicContext)) {
            this.unregisterFromSharedLayoutContext = magicContext.register(this)
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
        this.unregisterFromSharedLayoutContext &&
            this.unregisterFromSharedLayoutContext()
        this.stopLayoutAnimation && this.stopLayoutAnimation()
    }

    // TODO Can we combine this with MagicMotion?
    shouldComponentUpdate(nextProps: FeatureProps & ContextProps) {
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

    // TODO: Find a way to abstract this, as it's only needed in Framer
    resetRotation() {
        const { nativeElement, values } = this.props
        const rotate = values.get("rotate")
        this.current.rotate = rotate ? (rotate.get() as number) : 0
        if (!this.current.rotate) return

        nativeElement.setStyle("rotate", 0)
        nativeElement.render()
    }

    resetStyles() {
        const { animate, nativeElement, style = {} } = this.props

        const reset = resetStyles(style, this.supportedMagicValues)

        // If we're animating opacity separately, we don't want to reset
        // as it causes a visual flicker when adding the component
        // TODO: We should do this universally for all animating props
        // and account for variants too.
        if (typeof animate === "object" && animate.hasOwnProperty("opacity")) {
            delete reset.opacity
        }

        nativeElement.setStyle(reset)
        nativeElement.render()
    }

    snapshotOrigin() {
        const { nativeElement, transformPagePoint } = this.props
        const origin = snapshot(
            nativeElement,
            this.supportedMagicValues,
            transformPagePoint
        )
        applyCurrent(origin.style, this.current)

        this.measuredOrigin = origin
    }

    snapshotTarget() {
        const { nativeElement, style, transformPagePoint } = this.props

        const target = snapshot(
            nativeElement,
            this.supportedMagicValues,
            transformPagePoint
        )
        target.style.rotate = resolve(0, style && style.rotate)
        this.measuredTarget = target
    }

    hide(apply: boolean = false) {
        this.isVisible = false

        if (apply) {
            const { values } = this.props
            const opacity = values.get("opacity", 0)
            opacity.set(0)
        }
    }

    show(apply: boolean = false) {
        this.isVisible = true

        if (apply) {
            const { values, style } = this.props
            const opacity = values.get("opacity", 1)
            const newOpacity = style ? resolve(1, style.opacity) : 1
            opacity.set(newOpacity)
        } else {
            this.shouldRestoreVisibility = true
        }
    }

    // TODO: Reduce safeToRemove calls
    startAnimation({ origin, target, ...opts }: AutoAnimationConfig = {}) {
        const { nativeElement, values } = this.props
        const rotate = values.get("rotate")
        rotate && nativeElement.setStyle("rotate", rotate.get())

        if (!this.shouldTransition) {
            this.safeToRemove()
            return
        }

        syncRenderSession.open()

        this.visualTarget = target || this.measuredTarget
        this.visualOrigin = origin || this.measuredOrigin || this.visualTarget

        if (this.visualOrigin && this.visualTarget) {
            const animations = [
                this.startLayoutAnimation(opts),
                this.startStyleAnimation(opts),
            ].filter(Boolean)

            if (!animations.length) this.safeToRemove()

            Promise.all(animations).then(() => {
                const { onMagicComplete } = this.props
                onMagicComplete && onMagicComplete()
            })
        } else {
            this.safeToRemove()
        }

        syncRenderSession.flush()
    }

    /**
     * This uses the FLIP animation technique to animate physical dimensions
     * and correct distortion on related styles (ie borderRadius etc)
     */
    startLayoutAnimation(opts: AutoAnimationConfig) {
        let animation

        this.stopLayoutAnimation && this.stopLayoutAnimation()

        const originStyle = this.visualOrigin.style
        const targetStyle = this.visualTarget.style

        const isAnimatingRotate = Boolean(
            originStyle.rotate || targetStyle.rotate
        )
        // We really want to know if its ever animated rotate and the above isn't good enough
        if (isAnimatingRotate) this.hasAnimatedRotate = isAnimatingRotate

        const { values } = this.props
        const updaters = {}

        for (const key in this.supportedMagicValues) {
            const handler = this.supportedMagicValues[key]
            if (!handler.createUpdater) continue

            updaters[key] = handler.createUpdater(
                values,
                originStyle[key],
                targetStyle[key],
                this.current,
                this.delta,
                this.treeScale
            )
        }

        this.target = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }

        const x = values.get("x", 0)
        const y = values.get("y", 0)
        const scaleX = values.get("scaleX", 1)
        const scaleY = values.get("scaleY", 1)
        const rotate = values.get("rotate", 0)

        const opacity = values.get("opacity", this.visualOrigin.style.opacity)

        const frame = () => {
            // TODO: Break up each of these so we can animate separately
            const p = this.progress.get() / 1000
            this.updateBoundingBox(p, this.hasAnimatedRotate ? 0.5 : undefined)
            this.updateTransform(x, y, scaleX, scaleY)

            this.hasAnimatedRotate && this.updateRotate(p, rotate)

            for (const key in updaters) {
                const updater = updaters[key]
                updater && updater(p)
            }

            if (opts.crossfadeEasing) {
                opacity.set(
                    mix(
                        originStyle.opacity,
                        targetStyle.opacity,
                        opts.crossfadeEasing(p)
                    )
                )
            }
        }

        const progressOrigin = 0
        const progressTarget = 1000

        this.progress.set(progressOrigin)
        this.progress.set(progressOrigin) // Set twice to hard-reset velocity

        const { transition, animate } = this.props

        if (animate !== false) {
            animation = startAnimation(
                "progress",
                this.progress,
                progressTarget,
                {
                    ...(opts.transition || transition),
                    restDelta: 1,
                    restSpeed: 10,
                }
            ).then(() => this.safeToRemove())
        } else {
            this.safeToRemove()
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
    startStyleAnimation(opts: AutoAnimationConfig) {
        let shouldTransitionStyle = false
        const target: TargetAndTransition = {}
        const { values } = this.props
        const numAnimatableStyles = this.animatableStyles.length

        for (let i = 0; i < numAnimatableStyles; i++) {
            const key = this.animatableStyles[i]
            if (key === "opacity" && opts.crossfadeEasing) continue
            const originStyle = this.visualOrigin.style[key]
            const nextStyle = this.visualTarget.style[key]

            if (originStyle !== nextStyle) {
                shouldTransitionStyle = true
                const value = values.get(key, originStyle)
                value.set(originStyle)

                target[key] = nextStyle
            }
        }

        const { transition, controls } = this.props
        target.transition = opts.transition || transition || {}

        if (opts.crossfadeEasing) {
            target.transition = {
                opacity: {
                    ...target.transition,
                    type: "tween",
                    ease: opts.crossfadeEasing,
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
        calcTreeScale(this.treeScale, parentDeltas)
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

function isControlledTree(
    context: SharedLayoutTree | MagicBatchTree
): context is SharedLayoutTree {
    return !!(context as SharedLayoutTree).register
}

function resetAxis(axis: Axis, originAxis: Axis) {
    axis.min = originAxis.min
    axis.max = originAxis.max
}

function resetLayout(box: Box, originBox: Box) {
    resetAxis(box.x, originBox.x)
    resetAxis(box.y, originBox.y)
}
