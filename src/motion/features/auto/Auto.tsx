import * as React from "react"
import { useContext } from "react"
import { FeatureProps } from "../types"
import { SharedLayoutContext } from "../../../components/AnimateSharedLayout/SharedLayoutContext"
import {
    resetStyles,
    snapshot,
    applyCurrent,
    resolve,
    tweenAxisBox,
    applyTreeDeltas,
    calcBoxDelta,
    isTreeVisible,
    isSharedLayoutTree,
    getAnimatableValues,
    resetBox,
    fixTransparentRGBPair,
} from "./utils"
import { Snapshot, Style, BoxDelta, AutoAnimationConfig } from "./types"
import {
    SharedLayoutTree,
    SharedBatchTree,
    VisibilityAction,
    Presence,
} from "../../../components/AnimateSharedLayout/types"
import { MotionValue } from "../../../value"
import { syncRenderSession } from "../../../dom/sync-render-session"
import { TargetAndTransition } from "../../../types"
import { startAnimation } from "../../../animation/utils/transitions"
import { mix } from "@popmotion/popcorn"
import {
    usePresence,
    SafeToRemove,
} from "../../../components/AnimatePresence/use-presence"
import { defaultMagicValues, AutoValueHandlers } from "./values"
import { MotionPluginContext } from "../../context/MotionPluginContext"
import sync, { cancelSync } from "framesync"
import { elementDragControls } from "../../../behaviours/VisualElementDragControls"
import { AxisBox2D } from "../../../types/geometry"
export { SharedLayoutTree, SharedBatchTree }

/**
 * Magic Motion relies on multiple components and class components only support, hence this
 * wrapper component that provides those contexts as props.
 */
export const SharedLayoutContextProvider = (props: FeatureProps) => {
    const [isPresent, safeToRemove] = usePresence()
    const sharedLayoutContext = useContext(SharedLayoutContext)
    const { autoValues } = useContext(MotionPluginContext)

    return (
        <Auto
            // We allow isPresent to be overwritten by manually setting it to true/false
            // This is only intended for optimisations in Framer
            isPresent={isPresent}
            {...props}
            safeToRemove={safeToRemove}
            sharedLayoutContext={sharedLayoutContext}
            autoValues={autoValues}
        />
    )
}

interface ContextProps {
    isPresent: boolean
    safeToRemove?: null | SafeToRemove
    sharedLayoutContext: SharedLayoutTree | SharedBatchTree
    autoValues: AutoValueHandlers
}

export class Auto extends React.Component<FeatureProps & ContextProps> {
    /**
     * If this is a child of AnimateSharedLayout, this callback must be used to unregister on unmount
     */
    private unregisterSharedLayoutContext?: () => void

    /**
     * Used to stop the current animation on the component's progress MotionValue
     */
    private stopLayoutAnimation?: () => void

    /**
     * If this component is a child of both AnimateSharedLayout and AnimatePresence we need to know if
     * it's safe to remove. This logic usually runs when AnimateSharedLayout triggers this component's
     * startAnimation method. But if this component renders apart from AnimateSharedLayout, it needs to know
     * that it didn't run this method and in the event that it's leaving the tree, can safely call `safeToRemove`.
     */
    private willAnimate = false

    /**
     * A map of value handlers that we use to automatically animate.
     */
    private supportedAutoValues: AutoValueHandlers

    /**
     * A list of values that we should automatically animate without applying scale correction.
     */
    private animatableStyles: string[]

    /**
     * We use this value to track whether, on a given render, this component should animate. This is
     * decided in shouldComponentUpdate, but the logic governing both is different.
     */
    shouldAnimate = true

    /**
     * The depth in the React tree of this automatically animating component. Every automatically
     * animating component increments this and we use it to detect when a component is a root
     * auto-animate component of a given AnimateSharedLayout component, as these are used to crossfade
     * between shared layout trees.
     */
    depth: number

    /**
     * A snapshot of the component as it actually looked before a render.
     */
    measuredOrigin: Snapshot

    /**
     * A snapshot of the component as it would look after a render.
     */
    measuredTarget: Snapshot

    /**
     * A snapshot of the component as we want it to visually animate from. This might be a
     * snapshot of an entirely different component.
     */
    visualOrigin: Snapshot

    /**
     * A snapshot of the component as we want it to visually animate to. This might be a
     * snapshot of an entirely different component.
     */
    visualTarget: Snapshot

    /**
     * The `measuredOrigin` layout as corrected for all the transforms being applied up the
     * auto-animate tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is mutable to avoid object creation on each frame.
     */
    correctedLayout: AxisBox2D = {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
    }

    /**
     * The visual target we want to project our component into on a given frame.
     *
     * This is mutable to avoid object creation on each frame.
     */
    frameTarget: AxisBox2D = {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
    }

    /**
     * A transform delta that, when applied to `correctedLayout`, will make this component appear
     * on-screen as `frameTarget`.
     *
     * This is mutable to avoid object creation on each frame. It's also shared with every child down the
     * auto-animate tree so they can use it to calculate a new `correctedLayout` each frame.
     */
    delta: BoxDelta

    /**
     * A flag to check whether this component has ever animated rotate. We use this to force
     * originX/Y to 0.5
     */
    hasAnimatedRotate: boolean = false

    /**
     * A progress value that we use to interpolate between our `visualOrigin` and `visualTarget`. Currently
     * this brings the limitation that all layout and layout-affected values (like `x` or `boxShadow`) all share
     * the same animation. It would be relatively simple with further development to animate all of these
     * values independently.
     */
    progress: MotionValue<number>

    /**
     * The overall scale of the local coordinate system as transformed by all parents of this component. We use this
     * for scale correction on our calculated layouts and scale-affected values like `boxShadow`.
     *
     * This is mutable to avoid object creation on each frame.
     */
    treeScale = { x: 1, y: 1 }

    /**
     * The current, pre-correction values of every scale-corrected value. We keep a record of these throughout
     * an animation so if the animation is interrupted we can resume from this value instead of a scale-corrected
     * value that may have no relevance in the next treeScale context.
     */
    current: Partial<Style> = {
        rotate: 0,
    }

    /**
     * AnimatePresence currently only provides a binary true/false presence state. AnimateSharedLayout
     * currently also relies on an "entering" state, which it determines and stores here.
     */
    presence: Presence

    constructor(props: FeatureProps & ContextProps) {
        super(props)

        // TODO: Can we move these back here somehow
        this.delta = props.localContext.layoutDelta as BoxDelta
        this.depth = props.localContext.layoutDepth
        this.progress = props.localContext.layoutProgress as MotionValue<number>
        this.shouldAnimate =
            props._shouldAnimate !== undefined
                ? props._shouldAnimate
                : this.shouldAnimate

        const { autoValues } = props
        this.supportedAutoValues = {
            ...defaultMagicValues,
            ...autoValues,
        }

        this.animatableStyles = getAnimatableValues(this.supportedAutoValues)
    }

    componentDidMount() {
        const { sharedLayoutContext } = this.props

        if (isSharedLayoutTree(sharedLayoutContext)) {
            this.unregisterSharedLayoutContext = sharedLayoutContext.register(
                this
            )

            // Check if this render was handled by AnimateSharedLayout. If it was,
            // the usual logic in startAnimation to tell AnimatePresence that this component is safe to remove
            // will have run. If it wasn't, we have to do that here.
            this.componentDidUpdate = prevProps => {
                const { layoutId, layoutOrder } = this.props

                if (layoutId !== prevProps.layoutId) {
                    this.unregisterSharedLayoutContext &&
                        this.unregisterSharedLayoutContext()
                    this.unregisterSharedLayoutContext = sharedLayoutContext.register(
                        this
                    )
                } else if (
                    layoutOrder !== undefined &&
                    layoutOrder !== prevProps.layoutOrder
                ) {
                    sharedLayoutContext.move(this)
                    this.resetStyles()
                }

                if (!this.willAnimate) this.safeToRemove()
                this.willAnimate = false
            }
        } else {
            /**
             * If we're not a child of AnimateSharedLayout we can use some default batching that will
             * ensure all auto-animation read/write cycles are batched across components. This
             * reduces layout thrashing and ensures all measurements are correct. Currently, because componentDidUpdate
             * fires before new component componentDidMount, newly entering components are missed out and need
             * AnimateSharedLayout to work correctly.
             */
            this.getSnapshotBeforeUpdate = () => {
                this.snapshotOrigin()
                sharedLayoutContext.add(this)
                return null
            }

            this.componentDidUpdate = () => sharedLayoutContext.flush()
        }
    }

    componentWillUnmount() {
        this.unregisterSharedLayoutContext &&
            this.unregisterSharedLayoutContext()
        this.stopLayoutAnimation && this.stopLayoutAnimation()
    }

    shouldComponentUpdate(nextProps: FeatureProps & ContextProps) {
        if (this.props._shouldAnimate !== undefined) {
            this.shouldAnimate = this.props._shouldAnimate
            return true
        }

        const hasDependency =
            this.props.magicDependency !== undefined ||
            nextProps.magicDependency !== undefined
        const dependencyHasChanged =
            this.props.magicDependency !== nextProps.magicDependency

        const presenceHasChanged = this.props.isPresent !== nextProps.isPresent

        this.shouldAnimate =
            !hasDependency ||
            (hasDependency && dependencyHasChanged) ||
            presenceHasChanged

        return true
    }

    /**
     * Reset the component's rotation so we can accurately measure its bounding box. If it's rotated
     * when we snapshot, the bounding box will be reported as larger than the component's actual size.
     *
     * This is currently only available inside of Framer by setting supportRotate on AnimateSharedLayout.
     * It incurs an extra read/write cycle triggered on shouldComponentUpdate which, in concurrent mode,
     * might trigger more than once per render. So it isn't recommended for production.
     */
    resetRotation() {
        const { visualElement } = this.props
        const rotate = visualElement.getValue("rotate")
        this.current.rotate = rotate ? (rotate.get() as number) : 0
        if (!this.current.rotate) return

        visualElement.setStaticValues("rotate", 0)
        visualElement.render()
    }

    /**
     * Reset styles that we might be currently animating so we can read their target values from the DOM.
     */
    resetStyles() {
        const { animate, visualElement, style = {} } = this.props

        const reset = resetStyles(style, this.supportedAutoValues)

        // If we're animating opacity separately, we don't want to reset
        // as it causes a visual flicker when adding the component
        // TODO: We should do this universally for all animating props
        // and account for variants too.
        if (typeof animate === "object" && animate.hasOwnProperty("opacity")) {
            delete reset.opacity
        }

        visualElement.setStaticValues(reset)
        visualElement.render()
    }

    /**
     * Take a snapshot of the component as it currently exists before a render.
     */
    snapshotOrigin() {
        this.willAnimate = true
        const { visualElement } = this.props
        const origin = snapshot(visualElement, this.supportedAutoValues)

        applyCurrent(origin.style, this.current)

        return (this.measuredOrigin = origin)
    }

    /**
     * Take a snapshot of a component as it will exist after a render.
     */
    snapshotTarget() {
        const { visualElement, style } = this.props

        const target = snapshot(visualElement, this.supportedAutoValues)

        target.style.rotate = resolve(0, style && style.rotate)

        this.measuredTarget = target
    }

    popFromFlow() {
        const { visualElement } = this.props
        const { position } = this.measuredTarget.style

        if (position === "absolute" || position === "fixed") return

        const { x, y } = this.measuredTarget.layout

        visualElement.setStaticValues({
            position: "absolute",
            width: x.max - x.min,
            height: y.max - y.min,
        })

        visualElement.render()
    }

    /**
     * Hide this component using opacity. We can't set it to display: none as we might
     * still need to measure it or its children.
     *
     * This is triggered if the component is a child of AnimateSharedLayout and a new component
     * enters the tree that shares this component's layoutId.
     */
    hide() {
        this.delta.isVisible = false
        this.stopLayoutAnimation && this.stopLayoutAnimation()
        const { visualElement } = this.props
        const opacity = visualElement.getValue("opacity", 0)
        opacity.set(0)
        visualElement.render()

        if (!this.isPresent()) this.safeToRemove()
    }

    show() {
        this.delta.isVisible = true
        const { visualElement, style } = this.props
        const opacity = visualElement.getValue("opacity", 1)
        const newOpacity = style ? resolve(1, style.opacity) : 1
        opacity.set(newOpacity)
    }

    setVisibility(visibilityAction: VisibilityAction) {
        if (visibilityAction === VisibilityAction.Show) {
            this.show()
        } else {
            this.hide()
        }
        return this.safeToRemove()
    }

    /**
     * Start an auto or shared layout animation.
     */
    startAnimation({
        origin,
        target,
        visibilityAction,
        ...opts
    }: AutoAnimationConfig = {}) {
        if (visibilityAction !== undefined) {
            return this.setVisibility(visibilityAction)
        }

        let animationPromise: Promise<void> | undefined
        let animations: (Promise<void> | undefined)[] = []

        // Restore rotation before any writes. If we don't do this, and for whatever
        // reason the animation doesn't execute, rotation will be left at 0
        const { visualElement } = this.props
        const rotate = visualElement.getValue("rotate")
        rotate &&
            visualElement.setStaticValues("rotate", rotate.get() as number)

        this.visualTarget = target || this.measuredTarget

        // If we don't have a provided or measured origin, for instance if this is a newly-added component,
        // we can just take the target and use that to at least maintain its position on screen as parent
        // components animate
        this.visualOrigin = origin || this.measuredOrigin || this.visualTarget

        this.delta.isVisible =
            this.visualOrigin?.style.opacity !== 0 ||
            this.visualTarget?.style.opacity !== 0

        const { parentContext } = this.props
        const parentDeltas = parentContext.layoutDeltas || []

        this.shouldAnimate =
            opts.shouldAnimate !== undefined
                ? opts.shouldAnimate
                : this.shouldAnimate

        if (
            this.shouldAnimate &&
            this.visualOrigin &&
            this.visualTarget &&
            this.delta.isVisible &&
            isTreeVisible(parentDeltas)
        ) {
            syncRenderSession.open()

            animations = [
                this.startLayoutAnimation(opts),
                this.startStyleAnimation(opts),
            ].filter(Boolean)

            animationPromise = Promise.all(animations).then(() => {
                const { onMagicComplete } = this.props
                onMagicComplete && onMagicComplete()
            })

            syncRenderSession.flush()
        }

        // If we don't animate, make sure we call safeToRemove so if this is an
        // exiting component it'll get removed
        !animations.length && this.safeToRemove()

        // Force render to ensure there's no flashes of unstyled content from the reset
        visualElement.render()

        return animationPromise
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

        const { visualElement } = this.props
        const updaters = {}

        for (const key in this.supportedAutoValues) {
            const handler = this.supportedAutoValues[key]
            if (!handler.createUpdater) continue

            updaters[key] = handler.createUpdater(
                visualElement,
                originStyle[key],
                targetStyle[key],
                this.current,
                this.delta,
                this.treeScale,
                this.visualOrigin.layout,
                this.visualTarget.layout
            )
        }

        this.frameTarget = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }

        const x = visualElement.getValue("x", 0)
        const y = visualElement.getValue("y", 0)
        const scaleX = visualElement.getValue("scaleX", 1)
        const scaleY = visualElement.getValue("scaleY", 1)
        const rotate = visualElement.getValue("rotate", 0)

        // TODO: Make API for this, stop all values. Currently just doing this to stop drag inertia animations
        x.stop()
        y.stop()

        const opacity = visualElement.getValue("opacity", originStyle.opacity)

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

            if (opts.crossfade) {
                opacity.set(
                    opts.crossfade(originStyle.opacity, targetStyle.opacity, p)
                )
            }
        }

        const progressOrigin = 0
        const progressTarget = 1000

        this.progress.set(progressOrigin)
        this.progress.set(progressOrigin) // Set twice to hard-reset velocity

        const { transition, animate } = this.props

        if (animate !== false) {
            const dragControls = elementDragControls.get(visualElement)

            if (!dragControls || !dragControls.isDragging) {
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
                this.updateBoundingBox(progressOrigin)

                // Reset drag origin so the element doesn't look like it's moved in the DOM
                // TODO: This is currently lossy with big mouse movements
                const { x: dragOriginX, y: dragOriginY } = dragControls.origin
                dragOriginX.set(
                    dragOriginX.get() + this.delta.x.translate - x.get()
                )
                dragOriginY.set(
                    dragOriginY.get() + this.delta.y.translate - y.get()
                )

                this.safeToRemove()
            }
        } else {
            this.safeToRemove()
        }

        const { parentContext } = this.props
        const { layoutProgress } = parentContext
        const scheduleUpdate = () => sync.update(frame, false, true)

        const unsubscribeProgress = this.progress.onChange(scheduleUpdate)
        let unsubscribeParentProgress: () => void
        if (layoutProgress) {
            unsubscribeParentProgress = layoutProgress.onChange(scheduleUpdate)
        }

        this.stopLayoutAnimation = () => {
            cancelSync.update(frame)
            this.progress.stop()
            unsubscribeProgress()
            unsubscribeParentProgress && unsubscribeParentProgress()
        }

        // TODO: I would prefer this to be a scheduleUpdate call, for some reason this is breaking
        // visualOrigin in the sharedLayoutFramerSetup demonstration
        frame()

        return animation
    }

    /**
     * This is a straight animation between prev/next styles. This animates
     * styles that don't need scale inversion correction.
     */
    startStyleAnimation(opts: AutoAnimationConfig) {
        let shouldAnimateStyle = false
        const target: TargetAndTransition = {}
        const { visualElement } = this.props
        const numAnimatableStyles = this.animatableStyles.length

        for (let i = 0; i < numAnimatableStyles; i++) {
            const key = this.animatableStyles[i]
            if (key === "opacity" && opts.crossfade) continue
            let originStyle = this.visualOrigin.style[key]
            let targetStyle = this.visualTarget.style[key]

            /**
             * If backgroundColor has been read as `rgba(0 0 0 0)` it's mostly likely got a fully
             * transparent background. If we animate to/from this color, we'll animate to/from transparent
             * black rather than the transparent origin/target colour.
             */
            if (key === "backgroundColor") {
                ;[originStyle, targetStyle] = fixTransparentRGBPair(
                    originStyle,
                    targetStyle
                )
            }

            if (originStyle !== targetStyle) {
                shouldAnimateStyle = true
                const value = visualElement.getValue(key, originStyle)
                value.set(originStyle)

                target[key] = targetStyle
            }
        }

        const { transition, controls } = this.props
        target.transition = opts.transition || transition || {}

        if (shouldAnimateStyle) {
            return controls.start(target)
        }
    }

    updateBoundingBox(p: number, origin?: number) {
        const { parentContext } = this.props
        const parentDeltas = parentContext.layoutDeltas || []

        resetBox(this.correctedLayout, this.measuredTarget.layout)
        applyTreeDeltas(this.correctedLayout, this.treeScale, parentDeltas)
        tweenAxisBox(
            this.frameTarget,
            this.visualOrigin.layout,
            this.visualTarget.layout,
            p
        )
        calcBoxDelta(this.delta, this.frameTarget, this.correctedLayout, origin)
    }

    updateTransform(
        x: MotionValue<number>,
        y: MotionValue<number>,
        scaleX: MotionValue<number>,
        scaleY: MotionValue<number>
    ) {
        const { visualElement } = this.props
        const dx = this.delta.x
        const dy = this.delta.y

        visualElement.setStaticValues("originX", dx.origin)
        visualElement.setStaticValues("originY", dy.origin)

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
