import { TransformPoint2D } from "../../types/geometry"
import { HTMLMotionComponents } from "../html/types"
import { SVGMotionComponents } from "../svg/types"

export interface DOMVisualElementOptions {
    /**
     * A function that can map a page point between spaces. Used by Framer
     * to support dragging and layout animations within scaled space.
     *
     * @public
     */
    transformPagePoint?: TransformPoint2D

    /**
     * Allow `transform` to be set as `"none"` if all transforms are their default
     * values. Switching to this removes the element as a GPU layer which can lead to subtle
     * graphical shifts.
     *
     * @public
     */
    allowTransformNone?: boolean

    /**
     * Allow this element to be GPU-accelerated. We currently enable this by
     * adding a `translateZ(0)`.
     *
     * @public
     */
    enableHardwareAcceleration?: boolean
}

export type DOMMotionComponents = HTMLMotionComponents & SVGMotionComponents
