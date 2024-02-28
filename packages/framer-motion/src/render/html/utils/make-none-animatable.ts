import { getAnimatableNone } from "../../dom/value-types/animatable-none"
import { UnresolvedKeyframes } from "../../utils/KeyframesResolver"

/**
 * If we encounter keyframes like "none" or "0" and we also have keyframes like
 * "#fff" or "200px 200px" we want to find a keyframe to serve as a template for
 * the "none" keyframes. In this case "#fff" or "200px 200px" - then these get turned into
 * zero equivalents, i.e. "#fff0" or "0px 0px".
 */
export function makeNoneKeyframesAnimatable(
    unresolvedKeyframes: UnresolvedKeyframes<string | number>,
    noneKeyframeIndexes: number[],
    name?: string
) {
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
