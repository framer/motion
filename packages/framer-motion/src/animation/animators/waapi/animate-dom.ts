import {
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
} from "../../types"

export const createScopedWaapiAnimate = (_scope?: AnimationScope) => {
    return (
        _value: ElementOrSelector,
        _keyframes: DOMKeyframesDefinition,
        _options?: DynamicAnimationOptions
    ) => {}
}
