import { useMemo } from "react"
import { MotionProps } from "../../motion"
import { ResolvedValues } from "../types"
import { createLayoutState, createProjectionState } from "../utils/state"
import { buildSVGAttrs } from "./utils/build-attrs"
import { createSvgRenderState } from "./utils/create-render-state"

export function useSVGProps(props: MotionProps, visualState: ResolvedValues) {
    const visualProps = useMemo(() => {
        const state = createSvgRenderState()

        buildSVGAttrs(
            state,
            visualState,
            createProjectionState(),
            createLayoutState(),
            { enableHardwareAcceleration: false },
            props.transformTemplate
        )

        return {
            ...state.attrs,
            style: state.style,
        }
    }, [visualState])

    return visualProps
}
