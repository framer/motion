import { RepeatOptions } from "../../../types"

export function getFinalKeyframe<T>(
    keyframes: T[],
    { repeat, repeatType = "loop" }: RepeatOptions
): T {
    const index =
        repeat && repeatType !== "loop" && repeat % 2 === 1
            ? 0
            : keyframes.length - 1
    return keyframes[index]
}
