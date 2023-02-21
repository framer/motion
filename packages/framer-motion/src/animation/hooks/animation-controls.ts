import { invariant } from "../../utils/errors"
import {
    animateVisualElement,
    stopAnimation,
} from "../../render/utils/animation"
import { setValues } from "../../render/utils/setters"
import type { VisualElement } from "../../render/VisualElement"
import { AnimationControls } from "../types"

/**
 * @public
 */
export function animationControls(): AnimationControls {
    /**
     * Track whether the host component has mounted.
     */
    let hasMounted = false

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
            invariant(
                hasMounted,
                "controls.start() should only be called after a component has mounted. Consider calling within a useEffect hook."
            )

            const animations: Array<Promise<any>> = []
            subscribers.forEach((visualElement) => {
                animations.push(
                    animateVisualElement(visualElement, definition, {
                        transitionOverride,
                    })
                )
            })

            return Promise.all(animations)
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

            return () => {
                hasMounted = false
                controls.stop()
            }
        },
    }

    return controls
}
