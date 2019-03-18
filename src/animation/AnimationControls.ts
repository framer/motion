import { Variants, Variant, Transition } from "../types"
import { ComponentAnimationControls } from "../motion"

type PendingAnimations = {
    definition: Variant | string
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
    private componentControls = new Set<ComponentAnimationControls>()

    /**
     * A map of variants that can be later referenced via `start(variantLabel)`
     *
     * @internal
     */
    private variants: Variants = {}

    /**
     * Set variants on this and all child components.
     *
     * @param variants
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
     * @param transition
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
     * @param controls
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(controls: ComponentAnimationControls) {
        this.componentControls.add(controls)
        if (this.variants) controls.setVariants(this.variants)
        if (this.defaultTransition)
            controls.setDefaultTransition(this.defaultTransition)

        return () => this.componentControls.delete(controls)
    }

    /**
     * Starts an animation on all linked components.
     *
     * @param definition
     * @returns - A `Promise` that resolves when all animations have completed.
     *
     * ```jsx
     * animation.start('variantLabel')
     * animation.start({
     *   x: 0,
     *   transition: { duration: 1 }
     * })
     * ```
     *
     * @public
     */
    start(definition: Variant | string): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []
            this.componentControls.forEach(controls => {
                const animation = controls.start(definition)
                animations.push(animation)
            })

            return Promise.all(animations)
        } else {
            return new Promise(resolve => {
                this.pendingAnimations.push({ definition, resolve })
            })
        }
    }

    /**
     * Stops animations on all linked components.
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
        this.pendingAnimations.forEach(({ definition, resolve }) =>
            this.start(definition).then(resolve)
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
