import { getAnimatableNone } from "../../dom/value-types/animatable-none"
import { UnresolvedKeyframes } from "../../utils/KeyframesResolver"

export function makeNoneKeyframesAnimatable(
    unresolvedKeyframes: UnresolvedKeyframes<string | number>,
    noneKeyframeIndexes: number[],
    name?: string
) {
    /**
     * If we detected "none"-equivalent keyframes, we need to find a template
     */
    let i = 0
    let animatableTemplate: string | undefined = undefined
    while (i < unresolvedKeyframes.length && !animatableTemplate) {
        if (
            typeof unresolvedKeyframes[i] === "string" &&
            unresolvedKeyframes[i] !== "none" &&
            unresolvedKeyframes[i] !== "0"
        ) {
            animatableTemplate = unresolvedKeyframes[i] as string
        }
        i++
    }

    if (animatableTemplate && name) {
        for (const noneIndex of noneKeyframeIndexes) {
            unresolvedKeyframes[noneIndex] = getAnimatableNone(
                name,
                animatableTemplate
            )
        }
    }
}
