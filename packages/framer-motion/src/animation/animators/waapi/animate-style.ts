import { GroupPlaybackControls } from "../../GroupPlaybackControls"
import {
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
} from "../../types"
import { animateElements } from "./animate-elements"

export const createScopedWaapiAnimate = (scope?: AnimationScope) => {
    function scopedAnimate(
        elementOrSelector: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DynamicAnimationOptions
    ) {
        return new GroupPlaybackControls(
            animateElements(
                elementOrSelector,
                keyframes as DOMKeyframesDefinition,
                options,
                scope
            )
        )
    }

    return scopedAnimate
}

export const animateMini = /*@__PURE__*/ createScopedWaapiAnimate()
