import { ResolvedValues } from "../../render/types"

function isIdentityScale(scale: string | number | undefined) {
    return scale === undefined || scale === 1
}

export function hasScale({ scale, scaleX, scaleY }: ResolvedValues) {
    return (
        !isIdentityScale(scale) ||
        !isIdentityScale(scaleX) ||
        !isIdentityScale(scaleY)
    )
}

export function hasTransform(values: ResolvedValues) {
    return (
        hasScale(values) ||
        hasTranslate(values.x) ||
        hasTranslate(values.y) ||
        values.z ||
        values.rotate ||
        values.rotateX ||
        values.rotateY
    )
}

function hasTranslate(value: string | number | undefined) {
    return value && value !== "0%"
}
