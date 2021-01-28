import { isAnimationControls } from "../../animation/AnimationControls"
import { MotionProps } from "../../motion"
import { isForcedMotionValue } from "../../motion/utils/use-motion-values"
import { TargetAndTransition, TargetResolver } from "../../types"
import { AxisBox2D, BoxDelta, Point2D } from "../../types/geometry"
import { axisBox, delta } from "../../utils/geometry"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { ResolvedValues, VisualElement } from "../types"
import { checkIfControllingVariants } from "./variants"

// TODO: This is a duplicate
function resolveVariant(
    props: MotionProps,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any
) {
    if (typeof definition === "string") {
        definition = props.variants?.[definition]
    }

    return typeof definition === "function"
        ? definition(custom ?? props.custom, {}, {})
        : definition
}

/**
 * Represents the size and position we want to project a given visual
 * element into.
 */
export interface TargetProjection {
    /**
     * Whether we should attempt to project into this target box.
     */
    isEnabled: boolean

    /**
     * Whether this target box is locked. We might want to lock the box, for
     * instance if the user is dragging or animating it. Otherwise
     * we want to rebase the target box ontop of the measured layout.
     */
    isTargetLocked: boolean

    /**
     * The viewport-relative box we want to project the element into.
     */
    target: AxisBox2D

    /**
     * The viewport-relative box we want to project the element into after
     * it's had x/y/scale transforms applied.
     */
    targetFinal: AxisBox2D
}

/**
 * The visual state of a visual element. Contains the latest resolved
 * motion values and the target projection data.
 */
export interface VisualState {
    values: ResolvedValues
    projection: TargetProjection
}

export function createVisualState(
    props: MotionProps,
    parent?: VisualElement,
    blockInitialAnimation?: boolean,
    snapshot?: ResolvedValues
): VisualState {
    return {
        values:
            snapshot ||
            createInitialValues(props, parent, blockInitialAnimation),
        projection: {
            isEnabled: false,
            isTargetLocked: false,
            target: axisBox(),
            targetFinal: axisBox(),
        },
    }
}

function createInitialValues(
    props: MotionProps,
    parent?: VisualElement,
    blockInitialAnimation?: boolean
) {
    const { style } = props
    const values: ResolvedValues = {}

    for (const key in style) {
        if (isMotionValue(style[key])) {
            values[key] = style[key].get()
        } else if (isForcedMotionValue(key, props)) {
            values[key] = style[key]
        }
    }

    let { initial, animate } = props
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = isControllingVariants || props.variants

    if (isVariantNode && !isControllingVariants && props.inherit !== false) {
        const context = parent?.getVariantContext()

        if (context) {
            initial ??= context.initial
            animate ??= context.animate
        }
    }

    const initialToSet =
        blockInitialAnimation || initial === false ? animate : initial

    if (
        initialToSet &&
        typeof initialToSet !== "boolean" &&
        !isAnimationControls(initialToSet)
    ) {
        const list = Array.isArray(initialToSet) ? initialToSet : [initialToSet]
        list.forEach((definition) => {
            const resolved = resolveVariant(props, definition)
            if (!resolved) return

            const { transitionEnd, transition, ...target } = resolved

            for (const key in target) values[key] = target[key]
            for (const key in transitionEnd) values[key] = transitionEnd[key]
        })
    }

    return values
}

/**
 * Data about the element's current layout. Contains the latest measurements
 * as well as the latest calculations of how to project from this layout
 * into a given TargetProjection.
 */
export interface LayoutState {
    /**
     * Whether we've hydrated this state with the latest measurements.
     */
    isHydrated: boolean

    /**
     * The latest viewport-box measurements of the element without transforms.
     */
    layout: AxisBox2D

    /**
     * The measured viewport box as corrected by parent transforms up the
     * visual element tree.
     */
    layoutCorrected: AxisBox2D

    /**
     * The cumulative tree scale for this element. This starts at 1 per axis.
     * When a transform is applied to an element we also apply it to the tree scale.
     * The final value is used for scale-correcting values like border-radius,
     * as well as ensuring calculated CSS translations are applied to compensate
     * for this scale.
     */
    treeScale: Point2D

    /**
     * A mutable piece of data that we write into the latest projection calculations
     * that, when applied to an element, will project it from its layoutCorrected
     * box into the provided TargetProjection.target
     */
    delta: BoxDelta

    /**
     * A mutable piece of data that will project an element from layoutCorrected
     * into TargetProjection.targetFinal.
     */
    deltaFinal: BoxDelta

    /**
     * The latest generated delta transform. This is used to compare against
     * the previously-generated transform to determine whether we need to trigger
     * a render.
     */
    deltaTransform: string
}

export function createLayoutState(): LayoutState {
    return {
        isHydrated: false,
        layout: axisBox(),
        layoutCorrected: axisBox(),
        treeScale: { x: 1, y: 1 },
        delta: delta(),
        deltaFinal: delta(),
        deltaTransform: "",
    }
}

export const zeroLayout = createLayoutState()
