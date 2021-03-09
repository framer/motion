import { MotionProps } from "../../../motion"
import { useConstant } from "../../../utils/use-constant"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { VisualElement } from "../../types"
import { useStyle } from "./use-html-props"

function useInitialMotionProps(
    props: MotionProps,
    visualElement?: VisualElement
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

export function useSVGProps(props: MotionProps, visualElement?: VisualElement) {
    const svgProps = useInitialMotionProps(props, visualElement)
    const style = useStyle(props, visualElement)

    // TODO: Figure out why these aren't being removed
    delete style.transform
    delete style.transformOrigin

    svgProps.style = style

    return svgProps
}
