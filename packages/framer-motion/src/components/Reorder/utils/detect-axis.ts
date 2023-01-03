import { Box } from "../../../projection/geometry/types"

export function detectAxis(a: Box, b: Box): "x" | "y" {
    return b.x.min >= a.x.max ? "x" : "y"
}
