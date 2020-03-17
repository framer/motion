import {
    alpha,
    color,
    complex,
    degrees,
    scale,
    px,
    percent,
    progressPercentage,
    number,
    vw,
    vh,
    ValueType,
} from "style-value-types"

const int = { ...number, transform: Math.round }

export const auto: ValueType = {
    test: (v: any) => v === "auto",
    parse: v => v,
}

const testValueType = (v: any) => (type: ValueType) => type.test(v)

const dimensionSearchList = [number, px, percent, degrees, vw, vh, auto]
export const detectDimensionValueType = (v: any) =>
    dimensionSearchList.find(testValueType(v))

const valueTypeSearchList = [...dimensionSearchList, color, complex]
export const detectValueType = (v: any) =>
    valueTypeSearchList.find(testValueType(v))

const valueTypes: { [key: string]: ValueType } = {
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
    opacity: alpha,
    originX: progressPercentage,
    originY: progressPercentage,
    originZ: px,

    // Misc
    zIndex: int,

    // SVG
    fillOpacity: alpha,
    strokeOpacity: alpha,
    numOctaves: int,
}

export const getValueType = (key: string) => valueTypes[key]

export const getValueAsType = (value: any, type?: ValueType) => {
    return type && type.transform && typeof value === "number"
        ? type.transform(value)
        : value
}
