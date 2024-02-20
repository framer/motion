import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { GenericAnimation } from "./GenericAnimation"

export class AcceleratedAnimation<
    T extends string | number
> extends GenericAnimation<T> {
    constructor(options: ValueAnimationOptions) {}

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
