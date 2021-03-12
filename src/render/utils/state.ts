import { AxisBox2D, BoxDelta, Point2D } from "../../types/geometry"
import { axisBox, delta } from "../../utils/geometry"

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

export const createProjectionState = () => ({
    isEnabled: false,
    isTargetLocked: false,
    target: axisBox(),
    targetFinal: axisBox(),
})

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
