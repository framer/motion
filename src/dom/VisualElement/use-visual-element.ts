import { Ref } from "react"
import { invariant } from "hey-listen"
import { useConstant } from "../../utils/use-constant"
import { isRefObject } from "../../utils/is-ref-object"
import { VisualElement } from "./"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { syncRenderSession } from "../sync-render-session"

const createVisualElement = () => new VisualElement()

type RefFunction = (element: HTMLElement | SVGElement) => void

/**
 * TODO: Maybe we roll MotionValuesMap into VisualElement?
 * @internal
 */
export function useVisualElement(
    values: MotionValuesMap,
    enableHardwareAcceleration: boolean,
    externalRef?: Ref<Element>
): [VisualElement, RefFunction] {
    const visualElement = useConstant(createVisualElement)

    visualElement.setOption(
        "enableHardwareAcceleration",
        enableHardwareAcceleration
    )

    const ref: RefFunction = element => {
        if (element !== null && !visualElement.hasMounted()) {
            externalRef && mountRef(externalRef, element)

            visualElement.mount(element)

            values.mount((key, value) => {
                visualElement.setStyle(key, value as string | number)

                // TODO: Check we still need this
                if (syncRenderSession.isOpen()) {
                    syncRenderSession.push(visualElement)
                }
            })
        } else if (element === null) {
            invariant(
                visualElement.hasMounted(),
                "No ref found. Ensure components created with motion.custom forward refs using React.forwardRef"
            )

            externalRef && unmountRef(externalRef)
        }
    }

    return [visualElement, ref]
}

function mountRef(ref: Ref<Element>, element: Element) {
    if (typeof ref === "function") {
        ref(element)
    } else if (isRefObject(ref)) {
        ;(ref as any).current = element
    }
}

function unmountRef(ref: Ref<Element>) {
    if (typeof ref === "function") {
        ref(null)
    } else if (isRefObject(ref)) {
        ;(ref as any).current = null
    }
}
