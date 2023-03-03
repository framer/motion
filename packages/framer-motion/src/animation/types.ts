import { TargetAndTransition, TargetResolver, Transition } from "../types"
import type { VisualElement } from "../render/VisualElement"
import { Driver } from "./legacy-popmotion/types"
import { Easing } from "../easing/types"

export interface VelocityOptions {
    velocity?: number
    restSpeed?: number
    restDelta?: number
}

export interface AnimationLifecycleOptions<V> {
    onUpdate?: (v: V) => void
    onComplete?: VoidFunction
    onPlay?: VoidFunction
    onRepeat?: VoidFunction
    onStop?: VoidFunction
}

export interface AnimationPlaybackOptions {
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
    repeatDelay?: number
}

export interface DurationSpringOptions {
    duration?: number
    bounce?: number
}

export interface SpringOptions extends DurationSpringOptions, VelocityOptions {
    stiffness?: number
    damping?: number
    mass?: number
}

export interface DecayOptions extends VelocityOptions {
    keyframes?: number[]
    power?: number
    timeConstant?: number
    modifyTarget?: (v: number) => number
}

export interface InertiaOptions extends DecayOptions {
    bounceStiffness?: number
    bounceDamping?: number
    min?: number
    max?: number
}

export interface KeyframeOptions {
    ease?: Easing | Easing[]
    times?: number[]
}

export interface AnimationOptions<V = any>
    extends AnimationLifecycleOptions<V>,
        AnimationPlaybackOptions,
        Omit<SpringOptions, "keyframes">,
        Omit<InertiaOptions, "keyframes">,
        KeyframeOptions {
    keyframes: V[]
    elapsed?: number
    driver?: Driver
    type?: "decay" | "spring" | "keyframes" | "tween" | "inertia"
    duration?: number
    autoplay?: boolean
}

/**
 * @public
 */
export type ControlsAnimationDefinition =
    | string
    | string[]
    | TargetAndTransition
    | TargetResolver

/**
 * @public
 */
export interface AnimationControls {
    /**
     * Subscribes a component's animation controls to this.
     *
     * @param controls - The controls to subscribe
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(visualElement: VisualElement): () => void

    /**
     * Starts an animation on all linked components.
     *
     * @remarks
     *
     * ```jsx
     * controls.start("variantLabel")
     * controls.start({
     *   x: 0,
     *   transition: { duration: 1 }
     * })
     * ```
     *
     * @param definition - Properties or variant label to animate to
     * @param transition - Optional `transtion` to apply to a variant
     * @returns - A `Promise` that resolves when all animations have completed.
     *
     * @public
     */
    start(
        definition: ControlsAnimationDefinition,
        transitionOverride?: Transition
    ): Promise<any>

    /**
     * Instantly set to a set of properties or a variant.
     *
     * ```jsx
     * // With properties
     * controls.set({ opacity: 0 })
     *
     * // With variants
     * controls.set("hidden")
     * ```
     *
     * @privateRemarks
     * We could perform a similar trick to `.start` where this can be called before mount
     * and we maintain a list of of pending actions that get applied on mount. But the
     * expectation of `set` is that it happens synchronously and this would be difficult
     * to do before any children have even attached themselves. It's also poor practise
     * and we should discourage render-synchronous `.start` calls rather than lean into this.
     *
     * @public
     */
    set(definition: ControlsAnimationDefinition): void

    /**
     * Stops animations on all linked components.
     *
     * ```jsx
     * controls.stop()
     * ```
     *
     * @public
     */
    stop(): void
    mount(): () => void
}
