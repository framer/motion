import { TargetAndTransition, TargetResolver, Transition } from "../types"
import { invariant } from "hey-listen"
import { VisualElement } from "../render/VisualElement"
import {
    animateVisualElement,
    stopAnimation,
} from "../render/VisualElement/utils/animation"
import { setValues } from "../render/VisualElement/utils/setters"

type ControlsAnimationDefinition =
    | string
    | string[]
    | TargetAndTransition
    | TargetResolver

type PendingAnimations = {
    animation: [ControlsAnimationDefinition, Transition | undefined]
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
    private subscribers = new Set<VisualElement>()

    /**
     * Subscribes a component's animation controls to this.
     *
     * @param controls - The controls to subscribe
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(visualElement: VisualElement) {
        this.subscribers.add(visualElement)

        return () => this.subscribers.delete(visualElement)
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
        definition: ControlsAnimationDefinition,
        transitionOverride?: Transition
    ): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []
            this.subscribers.forEach((visualElement) => {
                animations.push(
                    animateVisualElement(visualElement, definition, {
                        transitionOverride,
                    })
                )
            })

            return Promise.all(animations)
        } else {
            return new Promise((resolve) => {
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
    set(definition: ControlsAnimationDefinition) {
        invariant(
            this.hasMounted,
            "controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook."
        )

        return this.subscribers.forEach((visualElement) => {
            setValues(visualElement, definition)
        })
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
        this.subscribers.forEach((visualElement) => {
            stopAnimation(visualElement)
        })
    }

    /**
     * Initialises the animation controls.
     *
     * @internal
     */
    mount() {
        this.hasMounted = true
        this.pendingAnimations.forEach(({ animation, resolve }) => {
            this.start(...animation).then(resolve)
        })
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
