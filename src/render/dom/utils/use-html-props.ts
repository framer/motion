import { useMemo } from "react"
import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { ResolvedValues } from "../../types"
import { createLayoutState, createProjectionState } from "../../utils/state"
import { buildHTMLStyles } from "./build-html-styles"
import { createHtmlRenderState } from "./create-html-render-state"

function useInitialMotionValues(
    { transformTemplate }: MotionProps,
    visualState: ResolvedValues
) {
    return useMemo(() => {
        const state = createHtmlRenderState()

        buildHTMLStyles(
            state,
            visualState,
            createProjectionState(),
            createLayoutState(),
            {},
            transformTemplate
        )

        const { vars, style } = state
        return { ...vars, ...style }
    }, [visualState])
}

export function useStyle(
    props: MotionProps,
    visualState: ResolvedValues
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

    style = { ...style, ...useInitialMotionValues(props, visualState) }

    if (props.transformValues) {
        style = props.transformValues(style)
    }

    return style
}

export function useHTMLProps(props: MotionProps, visualState: ResolvedValues) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}
    const style = useStyle(props, visualState)

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
