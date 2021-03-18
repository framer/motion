import { createElement } from "react"
import { useHTMLProps } from "../html/use-props"
import { filterProps } from "./utils/filter-props"
import { isSVGComponent } from "./utils/is-svg-component"
import { useSVGProps } from "../svg/use-props"
import { RenderComponent } from "../../motion/features/types"
import { HTMLRenderState } from "../html/types"
import { SVGRenderState } from "../svg/types"

export function createUseRender(forwardMotionProps = false) {
    const useRender: RenderComponent<
        HTMLElement | SVGElement,
        HTMLRenderState | SVGRenderState
    > = (Component, props, ref, { latestValues }, isStatic) => {
        const useVisualProps = isSVGComponent(Component)
            ? useSVGProps
            : useHTMLProps

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
        return createElement<any>(Component, elementProps)
    }

    return useRender
}
