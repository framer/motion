import { BoxDelta, Point2D } from "../../../types/geometry"

export function createDeltaTransform(delta: BoxDelta, treeScale: Point2D) {
    const x = delta.x.translate / treeScale.x
    const y = delta.y.translate / treeScale.y
    const scaleX = delta.x.scale
    const scaleY = delta.y.scale
    return `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`
}
