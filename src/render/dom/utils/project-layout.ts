import { BoxDelta, Point2D } from "../../../types/geometry"
import { ResolvedValues } from "../../types"
import { sortTransformProps, boxDistortingKeys } from "./transform"

export function createDeltaTransform(
    delta: BoxDelta,
    treeScale: Point2D,
    latestTransform?: ResolvedValues,
    transformKeys?: string[]
) {
    const x = delta.x.translate / treeScale.x
    const y = delta.y.translate / treeScale.y
    const scaleX = delta.x.scale
    const scaleY = delta.y.scale
    let transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`

    // TODO: This should be merged with build-transform before merge
    if (latestTransform && transformKeys) {
        transformKeys.sort(sortTransformProps)
        const numTransformKeys = transformKeys.length

        for (let i = 0; i < numTransformKeys; i++) {
            const key = transformKeys[i]
            if (boxDistortingKeys.has(key)) {
                transform += ` ${key}(${latestTransform[key]})`
            }
        }
    }

    return transform
}
