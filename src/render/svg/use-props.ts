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
            style: { ...state.style },
        }
    }, [visualState])

    if (props.style) {
        const rawStyles = {}
        copyRawValuesOnly(rawStyles, props.style as any, props)
        visualProps.style = { ...rawStyles, ...visualProps.style }
    }

    return visualProps
}
