import { RefObject } from "react"
import { BoundingBox2D } from "types/geometry"

export const isBoundingBoxRefObject = (
    ref: any
): ref is RefObject<BoundingBox2D> => {
    return (
        typeof ref === "object" &&
        ref.hasOwnProperty("current") &&
        ref.current.hasOwnProperty("top") &&
        ref.current.hasOwnProperty("left")
    )
}
