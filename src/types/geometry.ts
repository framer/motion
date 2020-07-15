/**
 * A typically user-facing description of a bounding box using traditional t/l/r/b
 *
 * @public
 */
export interface BoundingBox2D {
    top: number
    left: number
    bottom: number
    right: number
}

/**
 * A 3D bounding box
 *
 * @public
 */
export interface BoundingBox3D extends BoundingBox2D {
    front: number
    back: number
}

/**
 * A description of a single axis using non-axis specific terms to denote the min and max
 * value of any axis.
 *
 * @public
 */
export interface Axis {
    min: number
    max: number
}

/**
 * A description of a bounding box describing each axis individually. This allows us
 * to treate each axis generically.
 *
 * @public
 */
export interface AxisBox2D {
    x: Axis
    y: Axis
}

/**
 * @public
 */
export interface AxisBox3D extends AxisBox2D {
    z: Axis
}

/**
 * A description of a two-dimensional point
 *
 * @public
 */
export interface Point2D {
    x: number
    y: number
}

/**
 * A description of a three-dimensional point
 *
 * @public
 */
export interface Point3D extends Point2D {
    z: number
}

/**
 * A function that accepts a two-dimensional point and returns a new one.
 *
 * @public
 */
export type TransformPoint2D = (point: Point2D) => Point2D

/**
 * The transform delta that, when applied to Axis a will visually transform it to Axis b
 * @public
 */
export interface AxisDelta {
    translate: number
    scale: number
    origin: number
    originPoint: number
}

/**
 * The transform delta that, when applied to Box a will visually transform it to Box b.
 * @public
 */
export interface BoxDelta {
    x: AxisDelta
    y: AxisDelta
}
