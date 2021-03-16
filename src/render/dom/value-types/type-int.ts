import { number } from "style-value-types"

export const int = {
    ...number,
    transform: Math.round,
}
