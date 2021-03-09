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
            {},
            props.transformTemplate
        )

        return state.attrs
    }, [visualState])

    // const createAttrs = () => {
    //     const { attrs } = visualElement.build()
    //     const resolvedMotionValueProps = {}

    //     for (const key in props) {
    //         if (isMotionValue(props[key])) {
    //             resolvedMotionValueProps[key] = props[key].get()
    //         }
    //     }

    //     return { ...attrs, ...resolvedMotionValueProps }
    // }

    // return visualElement.isStatic ? createAttrs() : useConstant(createAttrs)
}

export function useSVGProps(props: MotionProps, visualState: ResolvedValues) {
    const svgProps = useInitialMotionProps(props, visualState)
    // TODO: This is calling both SVG and HTML useInitialMotioNprops
    const style = useStyle(props, visualState)

    // TODO: Figure out why these aren't being removed
    delete style.transform
    delete style.transformOrigin
    ;(svgProps as any).style = style

    return svgProps
}
