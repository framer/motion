import { MotionProps, MotionStyle } from "../../../motion/types"
import { useConstant } from "../../../utils/use-constant"
import { useIsInitialRender } from "../../../utils/use-initial-or-every-render"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { VisualElement } from "../../types"

const empty = () => ({})

function useStyle(visualElement: VisualElement, styleProp?: MotionStyle) {
    const isInitialRender = useIsInitialRender()
    const initialMotionValues = useConstant(empty)
    const style = {}

    if (styleProp) {
        for (const key in styleProp) {
            if (!isMotionValue(styleProp[key])) style[key] = styleProp[key]
        }
    }

    /**
     * We only want to add the MotionValues on initial render to support SSR
     * By keeping them the same on subsequent renders React won't recommit and
     * we'll keep the component pure while allowing the values to be updated
     * outside of React.
     */
    if (isInitialRender) {
        // for (const key in visualElement.style.latest) {
        //     initialMotionValues[key] = visualElement.style.latest[key]
        // }
    }

    return { ...initialMotionValues, ...style }
}

export function useHTMLProps(
    visualElement: VisualElement,
    { drag, style }: MotionProps
) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}
    style = useStyle(visualElement, style)

    if (Boolean(drag)) {
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
