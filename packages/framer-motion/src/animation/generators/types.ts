export interface AnimationState<V> {
    value: V
    done: boolean
}

export interface KeyframeGenerator<V> {
    calculatedDuration: null | number
    next: (t: number) => AnimationState<V>
}
