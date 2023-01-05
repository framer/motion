import { Repeat } from "../../../types"

export function getFinalKeyframe<T>(
    keyframes: T[],
    { repeat, repeatType = "loop" }: Repeat
): T {
    const index =
        repeat && repeatType !== "loop" && repeat % 2 === 1
            ? 0
            : keyframes.length - 1
    return keyframes[index]
}
