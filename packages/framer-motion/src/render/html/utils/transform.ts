/**
 * Generate a list of every possible transform key.
 */
export const transformPropOrder = [
    "transformPerspective",
    "x",
    "y",
    "z",
    "translateX",
    "translateY",
    "translateZ",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "skew",
    "skewX",
    "skewY",
]

/**
 * A quick lookup for transform props.
 */
export const transformProps = new Set(transformPropOrder)

/**
 * A quick lookup for transform origin props
 */
export const transformOriginProps = new Set(["originX", "originY", "originZ"])
