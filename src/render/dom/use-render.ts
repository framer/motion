import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { ResolvedValues, VisualElement } from "../types"
import { useHTMLProps } from "./utils/use-html-props"
import { filterProps } from "./utils/filter-props"
import { isSVGComponent } from "./utils/is-svg-component"
import { useSVGProps } from "./utils/use-svg-props"

export function createUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    forwardMotionProps = false
) {
    const useRender = (
        props: MotionProps,
        visualState: ResolvedValues,
        visualElement?: VisualElement
    ) => {
        const useVisualProps = isSVGComponent(Component)
            ? useSVGProps
            : useHTMLProps
        const visualProps = useVisualProps(props, visualState)
        const filteredProps = filterProps(
            props,
            typeof Component === "string",
            forwardMotionProps
        )
        const elementProps = { ...filteredProps, ...visualProps }

        if (visualElement) {
            elementProps.ref = visualElement.ref
        }

        return createElement<any>(Component, elementProps)
    }

    return useRender
}
