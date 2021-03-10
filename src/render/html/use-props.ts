import { useMemo } from "react"
import { MotionProps } from "../../motion/types"
import { isForcedMotionValue } from "../../motion/utils/is-forced-motion-value"
import { MotionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { ResolvedValues } from "../types"
import { buildHTMLStyles } from "./utils/build-styles"
import { createHtmlRenderState } from "./utils/create-render-state"

export function copyRawValuesOnly(
    target: ResolvedValues,
    source: { [key: string]: string | number | MotionValue },
    props: MotionProps
) {
    for (const key in source) {
        if (!isMotionValue(source[key]) && !isForcedMotionValue(key, props)) {
            target[key] = source[key] as string | number
        }
    }
}

function useInitialMotionValues(
    { transformTemplate }: MotionProps,
    visualState: ResolvedValues,
    isStatic: boolean
) {
    return useMemo(() => {
        const state = createHtmlRenderState()

        buildHTMLStyles(
            state,
            visualState,
            undefined,
            undefined,
            { enableHardwareAcceleration: !isStatic },
            transformTemplate
        )

        const { vars, style } = state
        return { ...vars, ...style }
    }, [visualState])
}

export function useStyle(
    props: MotionProps,
    visualState: ResolvedValues,
    isStatic: boolean
): ResolvedValues {
    const styleProp = props.style || {}
    let style = {}

    /**
     * Copy non-Motion Values straight into style
     */
    copyRawValuesOnly(style, styleProp as any, props)

    Object.assign(style, useInitialMotionValues(props, visualState, isStatic))

    if (props.transformValues) {
        style = props.transformValues(style)
    }

    return style
}

export function useHTMLProps(
    props: MotionProps,
    visualState: ResolvedValues,
    isStatic: boolean
) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {}
    const style = useStyle(props, visualState, isStatic)

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
