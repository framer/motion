import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { useConstant } from "../../../utils/use-constant"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { ResolvedValues, VisualElement } from "../../types"
import { createHtmlRenderState } from "./create-html-render-state"

function useInitialMotionValues(visualElement: VisualElement) {
    const createStyle = () => {
        const state = createHtmlRenderState()

        const { vars, style } = state
        return { ...vars, ...style }
    }
    return visualElement ? createStyle() : useConstant(createStyle)
}

export function useStyle(
    props: MotionProps,
    visualElement?: VisualElement
): ResolvedValues {
    const styleProp = props.style || {}
    let style = {}

    /**
     * Copy non-Motion Values straight into style
     */
    for (const key in styleProp) {
        // TODO We might want this to be a hasValue check? Although this could be impure
        if (
            !isMotionValue(styleProp[key]) &&
            !isForcedMotionValue(key, props)
        ) {
            style[key] = styleProp[key]
        }
    }

    style = { ...style, ...useInitialMotionValues(visualElement) }

    if (props.transformValues) {
        style = props.transformValues(style)
    }

    return style
}

export function useHTMLProps(
    props: MotionProps,
    visualElement?: VisualElement
) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}
    const style = useStyle(props, visualElement)

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
