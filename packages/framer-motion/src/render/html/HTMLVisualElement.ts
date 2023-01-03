import { HTMLRenderState } from "./types"
import { DOMVisualElementOptions } from "../dom/types"
import { buildHTMLStyles } from "./utils/build-styles"
import { isCSSVariable } from "../dom/utils/is-css-variable"
import { transformProps } from "./utils/transform"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { renderHTML } from "./utils/render"
import { getDefaultValueType } from "../dom/value-types/defaults"
import { measureViewportBox } from "../../projection/utils/measure"
import { MotionProps, MotionStyle } from "../../motion/types"
import { MotionConfigProps } from "../../components/MotionConfig"
import { Box } from "../../projection/geometry/types"
import { IProjectionNode, ResolvedValues } from "../.."
import { DOMVisualElement } from "../dom/DOMVisualElement"

export function getComputedStyle(element: HTMLElement) {
    return window.getComputedStyle(element)
}

export class HTMLVisualElement extends DOMVisualElement<
    HTMLElement,
    HTMLRenderState,
    DOMVisualElementOptions
> {
    type: "html"

    readValueFromInstance(
        instance: HTMLElement,
        key: string
    ): string | number | null | undefined {
        if (transformProps.has(key)) {
            const defaultType = getDefaultValueType(key)
            return defaultType ? defaultType.default || 0 : 0
        } else {
            const computedStyle = getComputedStyle(instance)
            const value =
                (isCSSVariable(key)
                    ? computedStyle.getPropertyValue(key)
                    : computedStyle[key]) || 0

            return typeof value === "string" ? value.trim() : value
        }
    }

    measureInstanceViewportBox(
        instance: HTMLElement,
        { transformPagePoint }: MotionProps & MotionConfigProps
    ): Box {
        return measureViewportBox(instance, transformPagePoint)
    }

    build(
        renderState: HTMLRenderState,
        latestValues: ResolvedValues,
        options: DOMVisualElementOptions,
        props: MotionProps
    ) {
        buildHTMLStyles(
            renderState,
            latestValues,
            options,
            props.transformTemplate
        )
    }

    scrapeMotionValuesFromProps(props: MotionProps, prevProps: MotionProps) {
        return scrapeMotionValuesFromProps(props, prevProps)
    }

    renderInstance(
        instance: HTMLElement,
        renderState: HTMLRenderState,
        styleProp?: MotionStyle | undefined,
        projection?: IProjectionNode<unknown> | undefined
    ): void {
        renderHTML(instance, renderState, styleProp, projection)
    }
}
