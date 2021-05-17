import * as React from "react"
import { FeatureProps } from "../types"
import { Axis, AxisBox2D } from "../../../types/geometry"
import { eachAxis } from "../../../utils/each-axis"
import {
    getValueTransition,
    startAnimation,
} from "../../../animation/utils/transitions"
import { calcRelativeOffset, checkIfParentHasChanged, tweenAxis } from "./utils"
import {
    SharedLayoutAnimationConfig,
    VisibilityAction,
} from "../../../components/AnimateSharedLayout/types"
import { usePresence } from "../../../components/AnimatePresence/use-presence"
import { LayoutProps } from "./types"
import { axisBox } from "../../../utils/geometry"
import { addScaleCorrection } from "../../../render/dom/projection/scale-correction"
import { defaultScaleCorrectors } from "../../../render/dom/projection/default-scale-correctors"
import { VisualElement } from "../../../render/types"

interface AxisLocks {
    x?: () => void
    y?: () => void
}

interface AnimateProps extends FeatureProps {
    layout?: LayoutProps["layout"]
    safeToRemove?: null | undefined | (() => void)
}

const progressTarget = 1000

class Animate extends React.Component<AnimateProps> {
    /**
     * A mutable object that tracks the target viewport box
     * for the current animation frame.
     */
    private frameTarget = axisBox()

    /**
     * The current animation target, we use this to check whether to start
     * a new animation or continue the existing one.
     */
    private currentAnimationTarget = axisBox()

    /**
     * Track whether we're animating this axis.
     */
    private isAnimating = {
        x: false,
        y: false,
    }

    private stopAxisAnimation: AxisLocks = {
        x: undefined,
        y: undefined,
    }

    private unsubLayoutReady: () => void

    private isAnimatingTree = false

    componentDidMount() {
        const { visualElement } = this.props
        visualElement.animateMotionValue = startAnimation
        visualElement.enableLayoutProjection()
        this.unsubLayoutReady = visualElement.onLayoutUpdate(this.animate)
        visualElement.layoutSafeToRemove = () => this.safeToRemove()

        addScaleCorrection(defaultScaleCorrectors)
    }

    componentWillUnmount() {
        this.unsubLayoutReady()
        eachAxis((axis) => this.stopAxisAnimation[axis]?.())
    }

    animate = (
        target: AxisBox2D,
        origin: AxisBox2D,
        {
            originBox,
            targetBox,
            visibilityAction,
            shouldStackAnimate,
            onComplete,
            prevParent,
            ...config
        }: SharedLayoutAnimationConfig = {}
    ) => {
        const { visualElement, layout } = this.props

        /**
         * Early return if we've been instructed not to animate this render.
         */
        if (shouldStackAnimate === false) {
            this.isAnimatingTree = false
            return this.safeToRemove()
        }

        /**
         * Prioritise tree animations
         */
        if (this.isAnimatingTree && shouldStackAnimate !== true) {
            return
        } else if (shouldStackAnimate) {
            this.isAnimatingTree = true
        }

        /**
         * Allow the measured origin (prev bounding box) and target (actual layout) to be
         * overridden by the provided config.
         */
        origin = originBox || origin
        target = targetBox || target

        /**
         * If this element has a projecting parent, there's an opportunity to animate
         * it relatively to that parent rather than relatively to the viewport. This
         * allows us to add orchestrated animations.
         */
        let isRelative = false
        const projectionParent = visualElement.getProjectionParent()

        if (projectionParent) {
            let prevParentViewportBox = projectionParent.prevViewportBox
            let parentLayout = projectionParent.getLayoutState().layout

            /**
             * If we're being provided a previous parent VisualElement by AnimateSharedLayout
             */
            if (prevParent) {
                /**
                 * If we've been provided an explicit target box it means we're animating back
                 * to this previous parent. So we can make a relative box by comparing to the previous
                 * parent's layout
                 */
                if (targetBox) {
                    parentLayout = prevParent.getLayoutState().layout
                }

                /**
                 * Likewise if we've been provided an explicit origin box it means we're
                 * animating out from a different element. So we should figure out where that was
                 * on screen relative to the new parent element.
                 */
                if (
                    originBox &&
                    !checkIfParentHasChanged(prevParent, projectionParent) &&
                    prevParent.prevViewportBox
                ) {
                    prevParentViewportBox = prevParent.prevViewportBox
                }
            }

            if (
                prevParentViewportBox &&
                isProvidedCorrectDataForRelativeSharedLayout(
                    prevParent,
                    originBox,
                    targetBox
                )
            ) {
                isRelative = true
                origin = calcRelativeOffset(prevParentViewportBox, origin)
                target = calcRelativeOffset(parentLayout, target)
            }
        }

        const boxHasMoved = hasMoved(origin, target)

        const animations = eachAxis((axis) => {
            if (layout === "position") {
                /**
                 * If layout is set to "position", we can resize the origin box based on the target
                 * box and only animate its position.
                 */
                const targetLength = target[axis].max - target[axis].min
                origin[axis].max = origin[axis].min + targetLength
            } else if (layout === "size") {
                /**
                 * If layout is set to "size", we move the origin to the target box and only animate
                 * its length.
                 */
                const originLength = origin[axis].max - origin[axis].min
                origin[axis].min = target[axis].min
                origin[axis].max = origin[axis].min + originLength
            }

            if (visualElement.projection.isTargetLocked) {
                return
            } else if (visibilityAction !== undefined) {
                visualElement.setVisibility(
                    visibilityAction === VisibilityAction.Show
                )
            } else if (boxHasMoved) {
                // If the box has moved, animate between it's current visual state and its
                // final state
                return this.animateAxis(axis, target[axis], origin[axis], {
                    ...config,
                    isRelative,
                })
            } else {
                this.stopAxisAnimation[axis]?.()

                // If the box has remained in the same place, immediately set the axis target
                // to the final desired state
                return visualElement.setProjectionTargetAxis(
                    axis,
                    target[axis].min,
                    target[axis].max,
                    isRelative
                )
            }
        })

        // Force a render to ensure there's no flash of uncorrected bounding box.
        visualElement.syncRender()

        /**
         * If this visualElement isn't present (ie it's been removed from the tree by the user but
         * kept in by the tree by AnimatePresence) then call safeToRemove when all axis animations
         * have successfully finished.
         */
        return Promise.all(animations).then(() => {
            this.isAnimatingTree = false
            onComplete && onComplete()
            visualElement.notifyLayoutAnimationComplete()
        })
    }

    /**
     * TODO: This manually performs animations on the visualElement's layout progress
     * values. It'd be preferable to amend the startLayoutAxisAnimation
     * API to accept more custom animations like this.
     */
    animateAxis(
        axis: "x" | "y",
        target: Axis,
        origin: Axis,
        { transition, isRelative }: SharedLayoutAnimationConfig = {}
    ) {
        /**
         * If we're not animating to a new target, don't run this animation
         */
        if (
            this.isAnimating[axis] &&
            axisIsEqual(target, this.currentAnimationTarget[axis])
        ) {
            return
        }

        this.stopAxisAnimation[axis]?.()
        this.isAnimating[axis] = true

        const { visualElement } = this.props
        const frameTarget = this.frameTarget[axis]
        const layoutProgress = visualElement.getProjectionAnimationProgress()[
            axis
        ]

        /**
         * Set layout progress back to 0. We set it twice to hard-reset any velocity that might
         * be re-incoporated into a subsequent spring animation.
         */
        layoutProgress.clearListeners()
        layoutProgress.set(0)
        layoutProgress.set(0)

        /**
         * Create an animation function to run once per frame. This will tween the visual bounding box from
         * origin to target using the latest progress value.
         */
        const frame = () => {
            // Convert the latest layoutProgress, which is a value from 0-1000, into a 0-1 progress
            const p = layoutProgress.get() / progressTarget

            // Tween the axis and update the visualElement with the latest values
            tweenAxis(frameTarget, origin, target, p)

            visualElement.setProjectionTargetAxis(
                axis,
                frameTarget.min,
                frameTarget.max,
                isRelative
            )
        }

        // Synchronously run a frame to ensure there's no flash of the uncorrected bounding box.
        frame()

        // Create a function to stop animation on this specific axis
        const unsubscribeProgress = layoutProgress.onChange(frame)

        this.stopAxisAnimation[axis] = () => {
            this.isAnimating[axis] = false
            layoutProgress.stop()
            unsubscribeProgress()
        }

        this.currentAnimationTarget[axis] = target

        const layoutTransition =
            transition ||
            visualElement.getDefaultTransition() ||
            defaultLayoutTransition

        // Start the animation on this axis
        const animation = startAnimation(
            axis === "x" ? "layoutX" : "layoutY",
            layoutProgress,
            progressTarget,
            layoutTransition && getValueTransition(layoutTransition, "layout")
        ).then(this.stopAxisAnimation[axis])

        return animation
    }

    safeToRemove() {
        this.props.safeToRemove?.()
    }

    render() {
        return null
    }
}

export function AnimateLayoutContextProvider(props: FeatureProps) {
    const [, safeToRemove] = usePresence()
    return <Animate {...props} safeToRemove={safeToRemove} />
}

function hasMoved(a: AxisBox2D, b: AxisBox2D) {
    return (
        !isZeroBox(a) &&
        !isZeroBox(b) &&
        (!axisIsEqual(a.x, b.x) || !axisIsEqual(a.y, b.y))
    )
}

const zeroAxis = { min: 0, max: 0 }
function isZeroBox(a: AxisBox2D) {
    return axisIsEqual(a.x, zeroAxis) && axisIsEqual(a.y, zeroAxis)
}

function axisIsEqual(a: Axis, b: Axis) {
    return a.min === b.min && a.max === b.max
}

const defaultLayoutTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

function isProvidedCorrectDataForRelativeSharedLayout(
    prevParent?: VisualElement,
    originBox?: AxisBox2D,
    targetBox?: AxisBox2D
) {
    return prevParent || (!prevParent && !(originBox || targetBox))
}
