import { TargetAndTransition, TargetResolver } from "../types"
import type { VisualElement } from "../render/VisualElement"
import { Easing } from "../easing/types"
import { Driver } from "./animators/js/types"
import { SVGPathProperties, VariantLabels } from "../motion/types"
import { SVGAttributes } from "../render/svg/types-attributes"

export interface AnimationPlaybackLifecycles<V> {
    onUpdate?: (latest: V) => void
    onPlay?: () => void
    onComplete?: () => void
    onRepeat?: () => void
    onStop?: () => void
}

export interface Transition
    extends AnimationPlaybackOptions,
        Omit<SpringOptions, "keyframes">,
        Omit<InertiaOptions, "keyframes">,
        KeyframeOptions {
    delay?: number
    elapsed?: number
    driver?: Driver
    type?: "decay" | "spring" | "keyframes" | "tween" | "inertia"
    duration?: number
    autoplay?: boolean
}

export interface ValueAnimationTransition<V = any>
    extends Transition,
        AnimationPlaybackLifecycles<V> {}

export interface ValueAnimationOptions<V = any>
    extends ValueAnimationTransition {
    keyframes: V[]
}

export interface AnimationScope<T = any> {
    readonly current: T
    animations: AnimationPlaybackControls[]
}

export type StyleTransitions = {
    [K in keyof CSSStyleDeclarationWithTransform]?: Transition
}

export type SVGPathTransitions = {
    [K in keyof SVGPathProperties]: Transition
}

export type SVGTransitions = {
    [K in keyof SVGAttributes]: Transition
}

export type VariableTransitions = {
    [key: `--${string}`]: Transition
}

export type AnimationOptionsWithValueOverrides<V = any> = StyleTransitions &
    SVGPathTransitions &
    SVGTransitions &
    VariableTransitions &
    ValueAnimationTransition<V>

export type ElementOrSelector =
    | Element
    | Element[]
    | NodeListOf<Element>
    | string

/**
 * @public
 */
export interface AnimationPlaybackControls {
    time: number
    speed: number
    duration: number
    stop: () => void
    play: () => void
    pause: () => void
    complete: () => void
    cancel: () => void
    then: (onResolve: VoidFunction, onReject?: VoidFunction) => Promise<void>
}

export type DynamicOption<T> = (i: number, total: number) => T

export interface CSSStyleDeclarationWithTransform
    extends Omit<CSSStyleDeclaration, "direction" | "transition"> {
    x: number | string
    y: number | string
    z: number | string
    rotateX: number | string
    rotateY: number | string
    rotateZ: number | string
    scaleX: number
    scaleY: number
    scaleZ: number
    skewX: number | string
    skewY: number | string
}

export type ValueKeyframe = string | number

export type UnresolvedValueKeyframe = ValueKeyframe | null

export type ValueKeyframesDefinition =
    | ValueKeyframe
    | ValueKeyframe[]
    | UnresolvedValueKeyframe[]

export type StyleKeyframesDefinition = {
    [K in keyof CSSStyleDeclarationWithTransform]?: ValueKeyframesDefinition
}

export type SVGKeyframesDefinition = {
    [K in keyof SVGAttributes]?: ValueKeyframesDefinition
}

export type VariableKeyframesDefinition = {
    [key: `--${string}`]: ValueKeyframesDefinition
}

export type SVGPathKeyframesDefinition = {
    [K in keyof SVGPathProperties]?: ValueKeyframesDefinition
}

export type DOMKeyframesDefinition = StyleKeyframesDefinition &
    SVGKeyframesDefinition &
    SVGPathKeyframesDefinition &
    VariableKeyframesDefinition

export interface VelocityOptions {
    velocity?: number
    restSpeed?: number
    restDelta?: number
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

export type AnimationDefinition =
    | VariantLabels
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
        definition: AnimationDefinition,
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
    set(definition: AnimationDefinition): void

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
