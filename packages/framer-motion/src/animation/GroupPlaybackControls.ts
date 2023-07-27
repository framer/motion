import { observeTimeline } from "../render/dom/scroll/observe"
import { supportsScrollTimeline } from "../render/dom/scroll/supports"
import { AnimationPlaybackControls } from "./types"

type PropNames = "time" | "speed" | "duration"

export class GroupPlaybackControls implements AnimationPlaybackControls {
    animations: AnimationPlaybackControls[]

    constructor(animations: Array<AnimationPlaybackControls | undefined>) {
        this.animations = animations.filter(
            Boolean
        ) as AnimationPlaybackControls[]
    }

    then(onResolve: VoidFunction, onReject?: VoidFunction) {
        return Promise.all(this.animations).then(onResolve).catch(onReject)
    }

    /**
     * TODO: Filter out cancelled or stopped animations before returning
     */
    private getAll(propName: PropNames) {
        return this.animations[0][propName] as any
    }

    private setAll(propName: PropNames, newValue: any) {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i][propName] = newValue
        }
    }

    attachTimeline(timeline: any) {
        const cancelAll = this.animations.map((animation) => {
            if (supportsScrollTimeline() && animation.attachTimeline) {
                animation.attachTimeline(timeline)
            } else {
                animation.pause()
                return observeTimeline((progress) => {
                    animation.time = animation.duration * progress
                }, timeline)
            }
        })

        return () => {
            cancelAll.forEach((cancelTimeline, i) => {
                if (cancelTimeline) cancelTimeline()

                this.animations[i].stop()
            })
        }
    }

    get time() {
        return this.getAll("time")
    }

    set time(time: number) {
        this.setAll("time", time)
    }

    get speed() {
        return this.getAll("speed")
    }

    set speed(speed: number) {
        this.setAll("speed", speed)
    }

    get duration() {
        let max = 0
        for (let i = 0; i < this.animations.length; i++) {
            max = Math.max(max, this.animations[i].duration)
        }
        return max
    }

    private runAll(
        methodName: keyof Omit<AnimationPlaybackControls, PropNames | "then">
    ) {
        this.animations.forEach((controls) => controls[methodName]())
    }

    play() {
        this.runAll("play")
    }

    pause() {
        this.runAll("pause")
    }

    stop() {
        this.runAll("stop")
    }

    cancel() {
        this.runAll("cancel")
    }

    complete() {
        this.runAll("complete")
    }
}
