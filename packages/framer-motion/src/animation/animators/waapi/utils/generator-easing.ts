import { secondsToMilliseconds } from "../../../../utils/time-conversion"
import { isGenerator } from "../../../generators/utils/is-generator"
import { pregenerateKeyframes } from "../../../generators/utils/pregenerate"
import { ValueAnimationOptions } from "../../../types"
import { supportsLinearEasing } from "./supports-linear-easing"

export function createGeneratorEasing(options: ValueAnimationOptions) {
    const { type = "keyframes" } = options
    if (isGenerator(type)) {
        const generator = type({ ...options, keyframes: [0, 100] })
        const pregenerated = pregenerateKeyframes(generator)
        const duration = secondsToMilliseconds(pregenerated.duration)
        options.duration = duration

        if (supportsLinearEasing()) {
            options.ease = (progress: number) => {
                return generator.next(duration * progress).value / 100
            }
        } else {
            options.ease = "easeOut"
        }
    }
}
