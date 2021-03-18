import { invariant } from "hey-listen"
import { VisualElement } from "../render/types"
import { animateVisualElement, stopAnimation } from "../render/utils/animation"
import { setValues } from "../render/utils/setters"
import { AnimationControls, PendingAnimations } from "./types"

/**
 * @public
 */
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
                return new Promise<void>((resolve) => {
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
