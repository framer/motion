import {
    alpha,
    color,
    degrees,
    scale,
    px,
    progressPercentage,
    number,
    ValueType,
    percent,
    vw,
    vh,
    complex,
    filter,
} from "style-value-types"

interface ValueTypeMap {
    [key: string]: ValueType
}

/**
 * ValueType for "auto"
 */
export const auto: ValueType = {
    test: (v: any) => v === "auto",
    parse: (v) => v,
}

/**
 * ValueType for ints
 */
const int = {
    ...number,
    transform: Math.round,
}

/**
 * A map of default value types for common values
 */
const defaultValueTypes: ValueTypeMap = {
    // Color props
    color,
    backgroundColor: color,
    outlineColor: color,
    fill: color,
    stroke: color,

    // Border props
    borderColor: color,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    borderWidth: px,
    borderTopWidth: px,
    borderRightWidth: px,
    borderBottomWidth: px,
    borderLeftWidth: px,
    borderRadius: px,
    radius: px,
    borderTopLeftRadius: px,
    borderTopRightRadius: px,
    borderBottomRightRadius: px,
    borderBottomLeftRadius: px,

    // Positioning props
    width: px,
    maxWidth: px,
    height: px,
    maxHeight: px,
    size: px,
    top: px,
    right: px,
    bottom: px,
    left: px,

    // Spacing props
    padding: px,
    paddingTop: px,
    paddingRight: px,
    paddingBottom: px,
    paddingLeft: px,
    margin: px,
    marginTop: px,
    marginRight: px,
    marginBottom: px,
    marginLeft: px,

    // Transform props
    rotate: degrees,
    rotateX: degrees,
    rotateY: degrees,
    rotateZ: degrees,
    scale,
    scaleX: scale,
    scaleY: scale,
    scaleZ: scale,
    skew: degrees,
    skewX: degrees,
    skewY: degrees,
    distance: px,
    translateX: px,
    translateY: px,
    translateZ: px,
    x: px,
    y: px,
    z: px,
    perspective: px,
    transformPerspective: px,
    opacity: alpha,
    originX: progressPercentage,
    originY: progressPercentage,
    originZ: px,

    // Misc
    zIndex: int,
    filter,
    WebkitFilter: filter,

    // SVG
    fillOpacity: alpha,
    strokeOpacity: alpha,
    numOctaves: int,
}

/**
 * A list of value types commonly used for dimensions
 */
const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto]

/**
 * Tests a provided value against a ValueType
 */
const testValueType = (v: any) => (type: ValueType) => type.test(v)

/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
export const findDimensionValueType = (v: any) =>
    dimensionValueTypes.find(testValueType(v))

/**
 * A list of all ValueTypes
 */
const valueTypes = [...dimensionValueTypes, color, complex]

/**
 * Tests a value against the list of ValueTypes
 */
export const findValueType = (v: any) => valueTypes.find(testValueType(v))

/**
 * Gets the default ValueType for the provided value key
 */
export const getDefaultValueType = (key: string) => defaultValueTypes[key]

/**
 * Provided a value and a ValueType, returns the value as that value type.
 */
export const getValueAsType = (value: any, type?: ValueType) => {
    return type && typeof value === "number"
        ? (type as any).transform(value)
        : value
}

export function getAnimatableNone(key: string, value: string) {
    let defaultValueType = getDefaultValueType(key)
    if (defaultValueType !== filter) defaultValueType = complex
    // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
    return defaultValueType.getAnimatableNone?.(value)
}
