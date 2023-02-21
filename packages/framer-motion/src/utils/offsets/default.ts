import { fillOffset } from "./fill"

export function defaultOffset(length: number): number[] {
    const offset = [0]
    fillOffset(offset, length - 1)
    return offset
}
