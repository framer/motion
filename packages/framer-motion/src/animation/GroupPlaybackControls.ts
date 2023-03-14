import { AnimationPlaybackControls } from "./types"

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
    get currentTime() {
        return this.animations[0].currentTime
    }

    /**
     * currentTime assignment could reasonably run every frame, so
     * we iterate using a normal loop to avoid function creation.
     */
    set currentTime(time: number) {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].currentTime = time
        }
    }

    private runAll(
        methodName: keyof Omit<
            AnimationPlaybackControls,
            "currentTime" | "then"
        >
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
}
