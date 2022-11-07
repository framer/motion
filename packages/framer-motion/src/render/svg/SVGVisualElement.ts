import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { SVGRenderState } from "./types"
import { DOMVisualElement } from "../dom/DOMVisualElement"
import { DOMVisualElementOptions } from "../dom/types"
import { buildSVGAttrs } from "./utils/build-attrs"
import { camelToDash } from "../dom/utils/camel-to-dash"
import { camelCaseAttributes } from "./utils/camel-case-attrs"
import { transformProps } from "../html/utils/transform"
import { renderSVG } from "./utils/render"
import { getDefaultValueType } from "../dom/value-types/defaults"
import { MotionProps, MotionStyle } from "../../motion/types"
import { MotionValue } from "../../value"
import { ResolvedValues } from "../types"
import { Box } from "../../projection/geometry/types"
import { createBox } from "../../projection/geometry/models"
import { IProjectionNode } from "../../projection/node/types"

export class SVGVisualElement extends DOMVisualElement<
    SVGElement,
    SVGRenderState,
    DOMVisualElementOptions
> {
    type: "svg"

    getBaseTargetFromProps(
        props: MotionProps,
        key: string
    ): string | number | MotionValue<any> | undefined {
        return props[key]
    }

    readValueFromInstance(instance: SVGElement, key: string) {
        if (transformProps.has(key)) {
            return getDefaultValueType(key)?.default || 0
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return instance.getAttribute(key)
    }

    measureInstanceViewportBox(): Box {
        return createBox()
    }

    scrapeMotionValuesFromProps(props: MotionProps) {
        return scrapeMotionValuesFromProps(props)
    }

    build(
        renderState: SVGRenderState,
        latestValues: ResolvedValues,
        options: DOMVisualElementOptions,
        props: MotionProps
    ) {
        buildSVGAttrs(
            renderState,
            latestValues,
            options,
            props.transformTemplate
        )
    }

    renderInstance(
        instance: SVGElement,
        renderState: SVGRenderState,
        styleProp?: MotionStyle | undefined,
        projection?: IProjectionNode<unknown> | undefined
    ): void {
        renderSVG(instance, renderState, styleProp, projection)
    }
}
