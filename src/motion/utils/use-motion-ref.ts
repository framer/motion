import * as React from "react"
import { useCallback } from "react"
import { VisualElement } from "../../render/types"
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
    return useCallback(
        (instance: Instance) => {
            instance && visualState.mount?.(instance)

            if (visualElement) {
                instance
                    ? visualElement.mount(instance)
                    : visualElement.unmount()
            }

            if (externalRef) {
                if (typeof externalRef === "function") {
                    externalRef(instance)
                } else if (isRefObject(externalRef)) {
                    ;(externalRef as any).current = instance
                }
            }
        },
        [visualElement]
    )
}
