import { ResolvedKeyframes } from "../../../render/utils/KeyframesResolver"
import { MotionGlobalConfig } from "../../../utils/GlobalConfig"
import { invariant } from "../../../utils/errors"
import { instantAnimationState } from "../../../utils/use-instant-transition-state"
import { isAnimatable } from "../../utils/is-animatable"

function hasKeyframesChanged(keyframes: ResolvedKeyframes<any>) {
    const current = keyframes[0]
    if (keyframes.length === 1) return true
    for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i] !== current) return true
    }
}

export function canSkipAnimation(
    keyframes: ResolvedKeyframes<any>,
    isInterruptingAnimation: boolean,
    name?: string,
    type?: string,
    isHandoff?: boolean,
    velocity?: number
) {
    let canSkip =
        !isHandoff &&
        !hasKeyframesChanged(keyframes) &&
        !isInterruptingAnimation &&
        !(type === "spring" && velocity)

    /**
     * Check if we're able to animate between the start and end keyframes,
     * and throw a warning if we're attempting to animate between one that's
     * animatable and another that isn't.
     */
    const originKeyframe = keyframes[0]
    const targetKeyframe = keyframes[keyframes.length - 1]
    const isOriginAnimatable = isAnimatable(originKeyframe, name)
    const isTargetAnimatable = isAnimatable(targetKeyframe, name)

    invariant(
        isOriginAnimatable === isTargetAnimatable,
        `You are trying to animate ${name} from "${originKeyframe}" to "${targetKeyframe}". ${originKeyframe} is not an animatable value - to enable this animation set ${originKeyframe} to a value animatable to ${targetKeyframe} via the \`style\` property.`
    )

    // Always skip if any of these are true
    if (
        !isOriginAnimatable ||
        !isTargetAnimatable ||
        instantAnimationState.current ||
        MotionGlobalConfig.skipAnimations
    ) {
        canSkip = true
    }

    return canSkip
}
