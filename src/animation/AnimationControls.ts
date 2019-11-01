import { Variants, Transition } from "../types"
import {
    ValueAnimationControls,
    AnimationDefinition,
} from "./ValueAnimationControls"
import { invariant } from "hey-listen"

type PendingAnimations = {
    animation: [AnimationDefinition, Transition | undefined]
    resolve: () => void
}

/**
 * Control animations on one or more components.
 *
 * @public
 */
export class AnimationControls {
    /**
     * Track whether the host component has mounted.
     *
     * @internal
     */
    private hasMounted = false

    /**
     * A default `Transition` to set on linked components.
     *
     * @internal
     */
    private defaultTransition: Transition

    /**
     * Pending animations that are started before a component is mounted.
     *
     * @internal
     */
    private pendingAnimations: PendingAnimations[] = []

    /**
     * A collection of linked component animation controls.
     *
     * @internal
     */
    private componentControls = new Set<ValueAnimationControls>()

    /**
     * A map of variants that can be later referenced via `start(variantLabel)`
     *
     * @internal
     */
    private variants: Variants

    /**
     * Set variants on this and all child components.
     *
     * @param variants - The variants to set
     *
     * @internal
     */
    setVariants(variants: Variants) {
        this.variants = variants
        this.componentControls.forEach(controls =>
            controls.setVariants(variants)
        )
    }

    /**
     * Set a default transition on this and all child components
     *
     * @param transition - The default transition to set
     *
     * @internal
     */
    setDefaultTransition(transition: Transition) {
        this.defaultTransition = transition
        this.componentControls.forEach(controls =>
            controls.setDefaultTransition(transition)
        )
    }

    /**
     * Subscribes a component's animation controls to this.
     *
     * @param controls - The controls to subscribe
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(controls: ValueAnimationControls) {
        this.componentControls.add(controls)
        if (this.variants) controls.setVariants(this.variants)
        if (this.defaultTransition)
            controls.setDefaultTransition(this.defaultTransition)

        return () => this.componentControls.delete(controls)
    }

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
    ): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []
            this.componentControls.forEach(controls => {
                const animation = controls.start(definition, {
                    transitionOverride,
                })
                animations.push(animation)
            })

            return Promise.all(animations)
        } else {
            return new Promise(resolve => {
                this.pendingAnimations.push({
                    animation: [definition, transitionOverride],
                    resolve,
                })
            })
        }
    }

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
     * @internalremarks
     * We could perform a similar trick to `.start` where this can be called before mount
     * and we maintain a list of of pending actions that get applied on mount. But the
     * expectation of `set` is that it happens synchronously and this would be difficult
     * to do before any children have even attached themselves. It's also poor practise
     * and we should discourage render-synchronous `.start` calls rather than lean into this.
     *
     * @public
     */
    set(definition: AnimationDefinition) {
        invariant(
            this.hasMounted,
            "controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook."
        )

        return this.componentControls.forEach(controls =>
            controls.apply(definition)
        )
    }

    /**
     * Stops animations on all linked components.
     *
     * ```jsx
     * controls.stop()
     * ```
     *
     * @public
     */
    stop() {
        this.componentControls.forEach(controls => controls.stop())
    }

    /**
     * Initialises the animation controls.
     *
     * @internal
     */
    mount() {
        this.hasMounted = true
        this.pendingAnimations.forEach(({ animation, resolve }) =>
            this.start(...animation).then(resolve)
        )
    }

    /**
     * Stops all child animations when the host component unmounts.
     *
     * @internal
     */
    unmount() {
        this.hasMounted = false
        this.stop()
    }
}

/**
 * @internal
 */
export const animationControls = () => new AnimationControls()
