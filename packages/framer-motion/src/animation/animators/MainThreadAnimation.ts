import {
    KeyframeResolver,
    ResolvedKeyframes,
} from "../../render/utils/KeyframesResolver"
import { spring } from "../generators/spring/index"
import { inertia } from "../generators/inertia"
import { keyframes as keyframesGeneratorFactory } from "../generators/keyframes"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { BaseAnimation } from "./BaseAnimation"
import { AnimationState, KeyframeGenerator } from "../generators/types"
import { invariant } from "../../dom-entry"
import { pipe } from "../../utils/pipe"
import { mix } from "../../utils/mix"
import { calcGeneratorDuration } from "../generators/utils/calc-duration"
import { DOMKeyframesResolver } from "../../render/dom/DOMKeyframesResolver"

type GeneratorFactory = (
    options: ValueAnimationOptions<any>
) => KeyframeGenerator<any>

const generators: { [key: string]: GeneratorFactory } = {
    decay: inertia,
    inertia,
    tween: keyframesGeneratorFactory,
    keyframes: keyframesGeneratorFactory,
    spring,
}

const percentToProgress = (percent: number) => percent / 100

export class MainThreadAnimation<
    T extends string | number
> extends BaseAnimation<T, {}> {
    private playState: AnimationPlayState = "idle"

    private holdTime: number | null = null

    private startTime: number | null = null

    private cancelTime: number | null = null

    private calculatedDuration: number | null = null

    private resolvedDuration: number | null = null

    private totalDuration: number | null = null

    private playbackSpeed = 1

    private initialKeyframe: T

    private mapPercentToKeyframes?: (percent: number) => T

    private generator: KeyframeGenerator<T>

    private mirroredGenerator?: KeyframeGenerator<T>

    protected initKeyframeResolver() {
        const { element, name, value } = this.options
        const Resolver =
            element && name && value ? KeyframeResolver : DOMKeyframesResolver

        return new Resolver(options)
    }

    protected initPlayback(keyframes: ResolvedKeyframes<T>, startTime: number) {
        this.initialKeyframe = keyframes[0]

        const {
            autoplay = true,
            type = "keyframes",
            repeat = 0,
            repeatDelay = 0,
            repeatType,
            velocity = 0,
        } = this.options

        const generatorFactory = generators[type] || keyframesGeneratorFactory

        if (
            generatorFactory !== keyframesGeneratorFactory &&
            typeof keyframes[0] !== "number"
        ) {
            if (process.env.NODE_ENV !== "production") {
                invariant(
                    keyframes.length === 2,
                    `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${keyframes}`
                )
            }

            this.mapPercentToKeyframes = pipe(
                percentToProgress,
                mix(keyframes[0], keyframes[1])
            ) as (t: number) => T

            keyframes = [0, 100]
        }

        this.generator = generatorFactory({ ...this.options, keyframes })

        if (repeatType === "mirror") {
            generatorFactory({
                ...this.options,
                keyframes: [...keyframes].reverse(),
                velocity: -velocity,
            })
        }

        /**
         * If duration is undefined and we have repeat options,
         * we need to calculate a duration from the generator.
         *
         * We set it to the generator itself to cache the duration.
         * Any timeline resolver will need to have already precalculated
         * the duration by this step.
         */
        if (this.generator.calculatedDuration === null && repeat) {
            this.generator.calculatedDuration = calcGeneratorDuration(
                this.generator
            )
        }

        this.calculatedDuration = this.generator.calculatedDuration

        if (this.calculatedDuration !== null) {
            this.resolvedDuration = this.calculatedDuration + repeatDelay
            this.totalDuration =
                this.resolvedDuration * (repeat + 1) - repeatDelay
        }

        autoplay && this.play()
    }

    tick(timestamp: number) {}

    get duration() {}

    get time() {}

    set time() {}

    get speed() {
        return this.playbackSpeed
    }

    set speed(newSpeed: number) {
        const hasChanged = this.playbackSpeed !== newSpeed
        this.playbackSpeed = newSpeed
        if (hasChanged) {
            this.time = millisecondsToSeconds(currentTime)
        }
    }

    get state() {
        return this.playState
    }

    play() {}

    pause() {
        this.state = "paused"
        this.holdTime = this.currentTime
    }

    stop() {}

    complete() {
        this.state = "finished"
        this.holdTime = null
    }

    cancel() {}

    sample(time: number): AnimationState<T> {
        this.startTime = 0
        return this.tick(time)
    }
}
