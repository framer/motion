export interface AnimationState<V> {
    value: V
    done: boolean
}

export interface KeyframeGenerator<V> {
    next: (t: number) => AnimationState<V>
}
