import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/use-motion-values"
import { useConstant } from "../../../utils/use-constant"
import { ResolvedValues, VisualElement } from "../../types"
import { initProjection } from "../../utils/projection"
import { htmlMutableState } from "../html-visual-element"
import { buildHTMLStyles } from "./build-html-styles"

function useInitialMotionValues(visualElement: VisualElement) {
    return useConstant(() => {
        const initialState = htmlMutableState()
        buildHTMLStyles(
            initialState,
            visualElement.getLatestValues(),
            initProjection(),
            {}
        )
        return { ...initialState.vars, ...initialState.style }
    })
}

function useStyle(
    visualElement: VisualElement,
    props: MotionProps
): ResolvedValues {
    const styleProp = props.style || {}
    const style = {}

    /**
     * Copy non-Motion Values straight into style
     */
    for (const key in styleProp) {
        // TODO We might want this to be a hasValue check? Although this could be impure
        if (!isForcedMotionValue(key, props)) {
            style[key] = styleProp[key]
        }
    }

    return { ...style, ...useInitialMotionValues(visualElement) }
}

export function useHTMLProps(visualElement: VisualElement, props: MotionProps) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}
    const style = useStyle(visualElement, props)

    if (Boolean(props.drag)) {
        // Disable the ghost element when a user drags
        htmlProps.draggable = false

        // Disable text selection
        style.userSelect = style.WebkitUserSelect = style.WebkitTouchCallout =
            "none"

        // Disable scrolling on the draggable direction
        style.touchAction =
            props.drag === true
                ? "none"
                : `pan-${props.drag === "x" ? "y" : "x"}`
    }

    htmlProps.style = style

    return htmlProps
}
