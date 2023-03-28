import { UnresolvedValueKeyframe } from "../types"

export function fillWildcardKeyframes(
    origin: number | string,
    [...keyframes]: UnresolvedValueKeyframe[]
) {
    /**
     * Ensure an wildcard keyframes are hydrated by the origin.
     */
    for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i] === null) {
            keyframes[i] = i === 0 ? origin : keyframes[i - 1]
        }
    }

    return keyframes
}
