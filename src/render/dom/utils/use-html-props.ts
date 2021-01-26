import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/use-motion-values"
import { useConstant } from "../../../utils/use-constant"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { ResolvedValues, VisualElement } from "../../types"

function useInitialMotionValues(visualElement: VisualElement) {
    const createStyle = () => {
        const { vars, style } = visualElement.build()
        return { ...vars, ...style }
    }
    return visualElement.isStatic ? createStyle() : useConstant(createStyle)
}

export function useStyle(
    visualElement: VisualElement,
    props: MotionProps
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
