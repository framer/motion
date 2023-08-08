import * as React from "react"
import { useCallback, useEffect } from "react"
import type { VisualElement } from "../../render/VisualElement"
import { isRefObject } from "../../utils/is-ref-object"
import { VisualState } from "./use-visual-state"

/**
 * Creates a ref function that, when called, hydrates the provided
 * external ref and VisualElement.
 */
export function useMotionRef<Instance, RenderState>(
    visualState: VisualState<Instance, RenderState>,
    visualElement?: VisualElement<Instance> | null,
    externalRef?: React.Ref<Instance>
): React.Ref<Instance> {
    /**
     * This React effect ensures the systematic unmounting of 'visualElement'
     * during the component's unmount phase. This cleanup is especially pivotal
     * in contexts where the component's rendering might have been affected by asynchronous
     * operations, such as with React.lazy and Suspense.
     *
     * Given that 'visualElement' animations are allowed to continue even when certain
     * child components might be rendered invalid by promises from React.lazy, it becomes
     * paramount to ensure that resources or side-effects associated with this DOM node
     * are properly managed and cleaned up to avoid potential pitfalls.
     */
    useEffect(() => {
        return () => {
            if (visualElement) {
                visualElement.unmount()
            }
        }
    }, [visualElement])

    return useCallback(
        (instance: Instance) => {
            /**
             * This section manages the lifecycle of 'visualState' and 'visualElement' based on
             * the presence of the 'instance' variable, which corresponds to a real DOM node.
             *
             * - When a valid DOM node (represented by 'instance') is detected, both 'visualState'
             *   and 'visualElement' are triggered to mount. This signifies the preparation or
             *   setup of visual components or states based on the detected node.
             *
             * - A complex scenario emerges when 'instance' becomes null, particularly within
             *   the environment of an outer Suspense boundary. With React.lazy, components are
             *   loaded lazily and the promises (or thenables) might render certain child components
             *   invalid based on their resolution or rejection. This can lead to situations where
             *   the expected DOM node isn't available. Yet, in these cases, the 'visualElement'
             *   doesn't get immediately unmounted. Animations tied to it persist, maintaining a
             *   consistent visual experience.
             */
            if (instance) {
                visualState.mount && visualState.mount(instance)
                visualElement && visualElement.mount(instance)
            }

            if (externalRef) {
                if (typeof externalRef === "function") {
                    externalRef(instance)
                } else if (isRefObject(externalRef)) {
                    ;(externalRef as any).current = instance
                }
            }
        },
        /**
         * Only pass a new ref callback to React if we've received a visual element
         * factory. Otherwise we'll be mounting/remounting every time externalRef
         * or other dependencies change.
         */
        [visualElement]
    )
}
