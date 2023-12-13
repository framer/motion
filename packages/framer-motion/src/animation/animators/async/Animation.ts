interface ValueAnimationOptions {}

export class ValueAnimation {
    private startTime: number | null
    private holdTime: number | null
    private timeline: DocumentTimeline | AnimationTimeline
    private playState: AnimationPlayState

    constructor(options: ValueAnimationOptions) {}

    private resolve() {}
}
