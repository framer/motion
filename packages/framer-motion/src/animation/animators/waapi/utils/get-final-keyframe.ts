import { Repeat } from "../../../../types"

const isNotNull = (value: unknown) => value !== null

export function getFinalKeyframe<T>(
    keyframes: T[],
    { repeat, repeatType = "loop" }: Repeat
): T {
    const resolvedKeyframes = keyframes.filter(isNotNull)
    const index =
        repeat && repeatType !== "loop" && repeat % 2 === 1
            ? 0
            : resolvedKeyframes.length - 1

    return resolvedKeyframes[index]
}
