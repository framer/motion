import { TargetAndTransition, TargetResolver, Transition } from "../types"
import { invariant } from "hey-listen"
import { VisualElement } from "../render/types"
import { animateVisualElement, stopAnimation } from "../render/utils/animation"
import { setValues } from "../render/utils/setters"

type ControlsAnimationDefinition =
    | string
    | string[]
    | TargetAndTransition
    | TargetResolver

type PendingAnimations = {
    animation: [ControlsAnimationDefinition, Transition | undefined]
    resolve: () => void
}

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
     * @internalremarks
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

export function animationControls(): AnimationControls {
    /**
     * Track whether the host component has mounted.
     */
    let hasMounted = false

    /**
     * Pending animations that are started before a component is mounted.
     * TODO: Remove this as animations should only run in effects
     */
    const pendingAnimations: PendingAnimations[] = []

    /**
     * A collection of linked component animation controls.
     */
    const subscribers = new Set<VisualElement>()

    const controls: AnimationControls = {
        subscribe(visualElement) {
            subscribers.add(visualElement)
            return () => void subscribers.delete(visualElement)
        },

        start(definition, transitionOverride) {
            /**
             * TODO: We only perform this hasMounted check because in Framer we used to
             * encourage the ability to start an animation within the render phase. This
             * isn't behaviour concurrent-safe so when we make Framer concurrent-safe
             * we can ditch this.
             */
            if (hasMounted) {
                const animations: Array<Promise<any>> = []
                subscribers.forEach((visualElement) => {
                    animations.push(
                        animateVisualElement(visualElement, definition, {
                            transitionOverride,
                        })
                    )
                })

                return Promise.all(animations)
            } else {
                return new Promise((resolve) => {
                    pendingAnimations.push({
                        animation: [definition, transitionOverride],
                        resolve,
                    })
                })
            }
        },

        set(definition) {
            invariant(
                hasMounted,
                "controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook."
            )

            return subscribers.forEach((visualElement) => {
                setValues(visualElement, definition)
            })
        },

        stop() {
            subscribers.forEach((visualElement) => {
                stopAnimation(visualElement)
            })
        },

        mount() {
            hasMounted = true
            pendingAnimations.forEach(({ animation, resolve }) => {
                controls.start(...animation).then(resolve)
            })

            return () => {
                hasMounted = false
                controls.stop()
            }
        },
    }

    return controls
}

export function isAnimationControls(v?: unknown): v is AnimationControls {
    return typeof v === "object" && typeof (v as any).start === "function"
}
