import { MotionProps } from "../../../motion"
import { useConstant } from "../../../utils/use-constant"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { VisualElement } from "../../types"
import { useStyle } from "./use-html-props"

function useInitialMotionProps(
    visualElement: VisualElement,
    props: MotionProps
) {
    const createAttrs = () => {
        const { attrs } = visualElement.build()
        const resolvedMotionValueProps = {}

        for (const key in props) {
            if (isMotionValue(props[key])) {
                resolvedMotionValueProps[key] = props[key].get()
            }
        }

        return { ...attrs, ...resolvedMotionValueProps }
    }

    return visualElement.isStatic ? createAttrs() : useConstant(createAttrs)
}

export function useSVGProps(visualElement: VisualElement, props: MotionProps) {
    const svgProps = useInitialMotionProps(visualElement, props)
    const style = useStyle(visualElement, props)

    // TODO: Figure out why these aren't being removed
    delete style.transform
    delete style.transformOrigin

    svgProps.style = style

    return svgProps
}
