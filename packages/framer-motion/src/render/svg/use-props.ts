"use client"

import { buildSVGAttrs, isSVGTag } from "motion-dom"
import { useMemo } from "react"
import { MotionProps } from "../../motion/types"
import { copyRawValuesOnly } from "../html/use-props"
import { ResolvedValues } from "../types"
import { createSvgRenderState } from "./utils/create-render-state"

export function useSVGProps(
    props: MotionProps,
    visualState: ResolvedValues,
    _isStatic: boolean,
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>
) {
    const visualProps = useMemo(() => {
        const state = createSvgRenderState()

        buildSVGAttrs(
            state,
            visualState,
            isSVGTag(Component),
            props.transformTemplate,
            props.style
        )

        return {
            ...state.attrs,
            style: { ...state.style },
        }
    }, [visualState])

    if (props.style) {
        /**
         * Build a fresh style each render rather than writing back into
         * the memoised visualProps, which would carry the previous
         * render's raw styles over (and above) the latest ones.
         */
        const style = {}
        copyRawValuesOnly(style, props.style as any, props)
        return { ...visualProps, style: { ...style, ...visualProps.style } }
    }

    return visualProps
}
