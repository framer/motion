import { mix, progress } from "popmotion"

export function fillOffset(offset: number[], remaining: number): void {
    const min = offset[offset.length - 1]
    for (let i = 1; i <= remaining; i++) {
        const offsetProgress = progress(0, remaining, i)
        offset.push(mix(min, 1, offsetProgress))
    }
}

export function defaultOffset(length: number): number[] {
    const offset = [0]
    fillOffset(offset, length - 1)
    return offset
}
