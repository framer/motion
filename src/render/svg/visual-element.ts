import { visualElement } from ".."
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { SVGRenderState } from "./types"
import { htmlConfig } from "../html/visual-element"
import { DOMVisualElementOptions } from "../dom/types"
import { buildSVGAttrs } from "./utils/build-attrs"
import { camelToDash } from "../dom/utils/camel-to-dash"
import { camelCaseAttributes } from "./utils/camel-case-attrs"
import { isTransformProp } from "../html/utils/transform"
import { getDefaultValueType } from "../dom/utils/value-types"
import { renderSVG } from "./utils/render"

export const svgVisualElement = visualElement<
    SVGElement,
    SVGRenderState,
    DOMVisualElementOptions
>({
    ...(htmlConfig as any),

    getBaseTarget(props, key) {
        return props[key]
    },

    readValueFromInstance(domElement, key) {
        if (isTransformProp(key)) {
            return getDefaultValueType(key)?.default || 0
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return domElement.getAttribute(key)
    },

    scrapeMotionValuesFromProps,

    build(
        _element,
        renderState,
        latestValues,
        projection,
        layoutState,
        options,
        props
    ) {
        buildSVGAttrs(
            renderState,
            latestValues,
            projection,
            layoutState,
            options,
            props.transformTemplate
        )
    },

    render: renderSVG,
})
