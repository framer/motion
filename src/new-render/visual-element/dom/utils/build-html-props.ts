import { MotionProps } from "../../../motion/types"
import { HTMLVisualElement } from "../HTMLVisualElement"

export function buildHTMLProps(
    visualElement: HTMLVisualElement,
    { drag }: MotionProps
) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}

    const style = {
        ...visualElement.reactStyle,
        ...visualElement.style,
        ...visualElement.vars,
    }

    if (!!drag) {
        // Disable the ghost element when a user drags
        htmlProps.draggable = false

        // Disable text selection
        style.userSelect = style.WebkitUserSelect = style.WebkitTouchCallout =
            "none"

        // Disable scrolling on the draggable direction
        style.touchAction =
            drag === true ? "none" : `pan-${drag === "x" ? "y" : "x"}`
    }

    htmlProps.style = style

    return htmlProps
}
