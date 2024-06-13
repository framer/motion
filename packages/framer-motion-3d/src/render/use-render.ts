import { createElement, useMemo } from "react"
import { ThreeMotionProps, ThreeRenderState } from "../types"
import {
    filterProps,
    isMotionValue,
    RenderComponent,
    resolveMotionValue,
} from "framer-motion"
import { MathProps, MathType } from "@react-three/fiber"
import { useHover } from "./gestures/use-hover"
import { useTap } from "./gestures/use-tap"

export const useRender: RenderComponent<MathType<any>, ThreeRenderState> = (
    Component,
    props: ThreeMotionProps & MathProps<any>,
    ref,
    _state,
    isStatic,
    visualElement
) => {
    const visualProps = useVisualProps(props)

    /**
     * If isStatic, render motion values as props
     * If !isStatic, render motion values as props on initial render
     */

    return createElement<any>(Component, {
        ref,
        ...filterProps(props, false, false),
        ...visualProps,
        onUpdate: props.onInstanceUpdate,
        ...useHover(isStatic, props, visualElement),
        ...useTap(isStatic, props, visualElement),
    } as any)
}

function useVisualProps(props: ThreeMotionProps & MathProps<any>) {
    return useMemo(() => {
        const visualProps: ThreeMotionProps & MathProps<any> = {}

        for (const key in props) {
            const prop = props[key as keyof typeof props]

            if (isMotionValue(prop)) {
                visualProps[key as keyof ThreeMotionProps] = prop.get()
            } else if (Array.isArray(prop) && prop.includes(isMotionValue)) {
                visualProps[key as keyof ThreeMotionProps] = prop.map(
                    resolveMotionValue as any
                ) as any
            }
        }

        return visualProps
    }, [])
}
