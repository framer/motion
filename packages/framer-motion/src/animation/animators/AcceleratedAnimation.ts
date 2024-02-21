import { ValueAnimationOptions } from "../types"
import { GenericAnimation } from "./GenericAnimation"

export class AcceleratedAnimation<
    T extends string | number
> extends GenericAnimation<T> {
    private animation: Animation | undefined

    constructor(options: ValueAnimationOptions) {}

    protected initPlayback() {}

    get duration() {}

    set duration() {}

    get time() {}

    set time() {}

    get speed() {}

    set speed() {}

    get state() {
        return this.animation ? this.animation.playState : "idle"
    }

    play() {}

    pause() {}

    stop() {}

    complete() {}

    cancel() {}
}
