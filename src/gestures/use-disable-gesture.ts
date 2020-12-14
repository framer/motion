import { DomHandlers } from "motion/types"
import { useEffect, useState } from "react"
import { VisualElement } from "../render/VisualElement"
import {
    setOverride,
    startOverride,
    clearOverride,
} from "../render/VisualElement/utils/overrides"
import { getGesturePriority } from "./utils/gesture-priority"

const hoverPriority = getGesturePriority("whileDisable")

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useDisableGesture(
    { whileDisable }: DomHandlers,
    visualElement: VisualElement
) {
    if (whileDisable) {
        setOverride(visualElement, whileDisable, hoverPriority)
    }

    // @ts-ignore
    const [disabled, setDisabled] = useState(visualElement.element.disabled)

    useEffect(() => {
        // Create new mutation observer
        const mutationObserver = new MutationObserver((mutations) => {
            // @ts-ignore
            setDisabled(mutations[0].target.disabled)
        })

        // @ts-ignore
        mutationObserver.observe(visualElement.element, { attributes: true })

        return () => {
            mutationObserver.disconnect()
        }
    }, [])

    useEffect(() => {
        whileDisable && disabled
            ? startOverride(visualElement, hoverPriority)
            : clearOverride(visualElement, hoverPriority)
    }, [disabled])
}
