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
