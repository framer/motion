import { ResolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { GenericAnimation } from "./GenericAnimation"

export class MainThreadAnimation<
    T extends string | number
> extends GenericAnimation<T> {
    private playState: AnimationPlayState = "idle"

    private holdTime: number | null = null

    private startTime: number | null = null

    private cancelTime: number | null = null

    private playbackSpeed = 1

    constructor(options: ValueAnimationOptions) {}

    initPlayback(keyframes: ResolvedKeyframes<T>, startTime: number) {}

    get duration() {}

    set duration() {}

    get time() {}

    set time() {}

    get speed() {}

    set speed() {}

    play() {}

    pause() {}

    stop() {}

    complete() {}

    cancel() {}
}
