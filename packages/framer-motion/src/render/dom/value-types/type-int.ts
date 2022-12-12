import { number } from "../../../value/types/numbers"

export const int = {
    ...number,
    transform: Math.round,
}
