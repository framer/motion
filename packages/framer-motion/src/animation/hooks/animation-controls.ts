import { invariant } from "../../utils/errors"
import { setValues } from "../../render/utils/setters"
import type { VisualElement } from "../../render/VisualElement"
import type {
    AnimationControls,
    AnimationDefinition,
    Transition,
} from "../types"
import { animateVisualElement } from "../interfaces/visual-element"

/**
 * Represents an individual animation start call.
 * Each item encapsulates:
 *  - `definition`: The details of the desired animation.
 *  - `transitionOverride` (optional): Overrides for default transition settings.
 *  - `resolve`: Promise resolution function, invoked when the animation completes successfully.
 *  - `reject`: Promise rejection function, invoked upon animation error or failure.
 */
type StartQueueItem = {
    definition: AnimationDefinition
    transitionOverride?: Transition
    resolve: (value?: any) => void
    reject: (reason?: any) => void
}

function stopAnimation(visualElement: VisualElement) {
    visualElement.values.forEach((value) => value.stop())
}

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

    /**
     * `startQueue` is an array that temporarily holds animation start calls, ensuring they are
     * deferred until their respective visual elements have subscribed to the animation controller.
     */
    const startQueue: Array<StartQueueItem> = []

    const controls: AnimationControls = {
        subscribe(visualElement) {
            subscribers.add(visualElement)

            // Upon a new subscription, handle any queued animations.
            flushStartQueue()

            return () => void subscribers.delete(visualElement)
        },

        start(definition, transitionOverride) {
            invariant(
                hasMounted,
                "controls.start() should only be called after a component has mounted. Consider calling within a useEffect hook."
            )

            if (subscribers.size === 0) {
                /*
                 * Return a new promise to keep track of the animation state.
                 * The promise will be resolved or rejected when the visual element eventually subscribes
                 * and the queued animations are processed.
                 */
                return new Promise((resolve, reject) => {
                    /*
                     * If there are no subscribers at the moment, add the animation details to the startQueue.
                     * This ensures that when a visual element eventually subscribes, the queued animations can be processed and played.
                     */
                    startQueue.push({
                        definition,
                        transitionOverride,
                        resolve,
                        reject,
                    })
                })
            }

            const animations: Array<Promise<void>> = []
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

    // Helper function to process the startQueue
    async function flushStartQueue() {
        // Copy startQueue to prevent mutation during iteration, ensuring consistent processing.
        const currentQueue = [...startQueue]

        // Clear the startQueue by setting its length to 0, efficiently removing all its items.
        startQueue.length = 0

        for (const item of currentQueue) {
            const { definition, transitionOverride, resolve, reject } = item

            try {
                const result = controls.start(definition, transitionOverride)
                if (result instanceof Promise) {
                    await result // This ensures that any rejection from the promise leads to the catch block.
                }
                resolve() // Signal successful completion
            } catch (error) {
                reject(error) // Signal that an error occurred
            }
        }
    }

    return controls
}
