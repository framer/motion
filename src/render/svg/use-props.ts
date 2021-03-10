import { useMemo } from "react"
import { MotionProps } from "../../motion"
import { copyRawValuesOnly } from "../html/use-props"
import { ResolvedValues } from "../types"
import { buildSVGAttrs } from "./utils/build-attrs"
import { createSvgRenderState } from "./utils/create-render-state"

export function useSVGProps(props: MotionProps, visualState: ResolvedValues) {
    const visualProps = useMemo(() => {
        const state = createSvgRenderState()

        buildSVGAttrs(
            state,
            visualState,
            undefined,
            undefined,
            { enableHardwareAcceleration: false },
            props.transformTemplate
        )

        return {
            ...state.attrs,
            style: state.style,
        }
    }, [visualState])

    /**
     * Remove transform or transformOrigin - these are built relying on measurements
     * of the SVG element, which we won't have at initial render, and can't access
     * safely in concurrent mode in subsequent renders.
     */
    delete (visualProps.style as any).transform
    delete (visualProps.style as any).transformOrigin

    if (props.style) {
        const rawStyles = {}
        copyRawValuesOnly(rawStyles, props.style as any, props)
        visualProps.style = { ...rawStyles, ...visualProps.style }
    }

    return visualProps
}
