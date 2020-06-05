import { MotionProps } from "../../../motion/types"
import { HTMLVisualElement } from "../HTMLVisualElement"

export function buildHTMLProps(
    visualElement: HTMLVisualElement,
    { drag }: MotionProps
) {
    visualElement.build()

    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {
        style: {
            ...visualElement.staticStyle,
            ...visualElement.style,
            ...visualElement.vars,
        },
    }

    if (!!drag) {
        // Disable text selection
        htmlProps.style.userSelect = "none"

        // Disable the ghost element when a user drags
        htmlProps.draggable = false
    }

    return htmlProps
}
