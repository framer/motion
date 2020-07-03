/**
 * @public
 */
export interface BoundingBox2D {
    top: number
    left: number
    bottom: number
    right: number
}

/**
 * @public
 */
export interface BoundingBox3D extends BoundingBox2D {
    front: number
    back: number
}

/**
 * @public
 */
export interface Axis {
    min: number
    max: number
}

/**
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
 * @public
 */
export interface Point2D {
    x: number
    y: number
}

/**
 * @public
 */
export interface Point3D extends Point2D {
    z: number
}

/**
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
