import { useMemo } from "react"
import { MotionProps } from "../../../motion"
import { ResolvedValues } from "../../types"
import { createLayoutState, createProjectionState } from "../../utils/state"
import { buildSVGAttrs } from "./build-svg-attrs"
import { createSvgRenderState } from "./create-svg-render-state"
import { useStyle } from "./use-html-props"

function useInitialMotionProps(
    props: MotionProps,
    visualState: ResolvedValues
) {
    return useMemo(() => {
        const state = createSvgRenderState()

        buildSVGAttrs(
            state,
            visualState,
            createProjectionState(),
            createLayoutState(),
            { enableHardwareAcceleration: false },
            props.transformTemplate
        )

        return state.attrs
    }, [visualState])
}

export function useSVGProps(
    props: MotionProps,
    visualState: ResolvedValues,
    isStatic: boolean
) {
    const svgProps = useInitialMotionProps(props, visualState)
    // TODO: This is calling both SVG and HTML useInitialMotioNprops
    const style = useStyle(props, visualState, isStatic)

    // TODO: Figure out why these aren't being removed
    delete style.transform
    delete style.transformOrigin
    ;(svgProps as any).style = style

    return svgProps
}
