import { createElement } from "react"
import { filterProps } from "./utils/filter-props"
import { RenderComponent } from "../../motion/features/types"
import { HTMLRenderState } from "../html/types"
import { SVGRenderState } from "../svg/types"
import { MotionProps } from "../../motion/types"
import { ResolvedValues } from "../types"

export type UseVisualProps = (
    props: MotionProps,
    visualState: ResolvedValues,
    isStatic: boolean
) => any

export type CreateUseRender = (
    forwardMotionProps: boolean,
    useVisualProps: UseVisualProps
) => RenderComponent<HTMLElement | SVGElement, HTMLRenderState | SVGRenderState>

export function createUseRender(
    forwardMotionProps = false,
    useVisualProps: UseVisualProps
) {
    const useRender: RenderComponent<
        HTMLElement | SVGElement,
        HTMLRenderState | SVGRenderState
    > = (Component, props, projectionId, ref, { latestValues }, isStatic) => {
        const visualProps = useVisualProps(props, latestValues, isStatic)
        const filteredProps = filterProps(
            props,
            typeof Component === "string",
            forwardMotionProps
        )
        const elementProps = {
            ...filteredProps,
            ...visualProps,
            ref,
        }

        if (projectionId) {
            elementProps["data-projection-id"] = projectionId
        }

        return createElement<any>(Component, elementProps)
    }

    return useRender
}
