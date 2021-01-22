import { visualElement } from ".."
import { isMotionValue } from "../../value/utils/is-motion-value"
import { htmlConfig } from "./html-visual-element"
import { DOMVisualElementOptions, SVGMutableState } from "./types"
import { buildSVGAttrs } from "./utils/build-svg-attrs"
import { camelToDash } from "./utils/camel-to-dash"
import { camelCaseAttributes } from "./utils/svg-camel-case-attrs"
import { isTransformProp } from "./utils/transform"
import { getDefaultValueType } from "./utils/value-types"

const zeroDimensions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
}

export const svgMutableState = () => ({
    ...htmlConfig.initMutableState(),
    attrs: {},
    dimensions: zeroDimensions,
})

export const svgVisualElement = visualElement<
    SVGElement,
    SVGMutableState,
    DOMVisualElementOptions
>({
    ...(htmlConfig as any),
    initMutableState: svgMutableState,
    onMount(element, instance, mutableState) {
        try {
            mutableState.dimensions =
                typeof (instance as SVGGraphicsElement).getBBox === "function"
                    ? (instance as SVGGraphicsElement).getBBox()
                    : (instance.getBoundingClientRect() as DOMRect)
        } catch (e) {
            // Most likely trying to measure an unrendered element under Firefox
            mutableState.dimensions = zeroDimensions
        }

        if (isPath(instance)) {
            mutableState.totalPathLength = instance.getTotalLength()
        }

        /**
         * Ensure we render the element as soon as possible to reflect the measured dimensions.
         * Preferably this would happen synchronously but we put it in rAF to prevent layout thrashing.
         */
        element.scheduleRender()
    },

    getBaseTarget(props, key) {
        return props[key]
    },

    readNativeValue(domElement, key) {
        if (isTransformProp(key)) {
            return getDefaultValueType(key)?.default || 0
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return domElement.getAttribute(key)
    },

    scrapeMotionValuesFromProps(props) {
        const newValues = htmlConfig.scrapeMotionValuesFromProps(props)

        for (const key in props) {
            if (isMotionValue(props[key])) {
                newValues[key] = props[key]
            }
        }

        return newValues
    },

    build(latest, mutableState, projection, options, props) {
        buildSVGAttrs(
            mutableState,
            latest,
            projection,
            options,
            props.transformTemplate
        )
    },

    render(element, mutableState) {
        htmlConfig.render(element as any, mutableState)

        for (const key in mutableState.attrs) {
            element.setAttribute(
                !camelCaseAttributes.has(key) ? camelToDash(key) : key,
                mutableState.attrs[key] as string
            )
        }
    },
})

function isPath(
    element: SVGElement | SVGPathElement
): element is SVGPathElement {
    return element.tagName === "path"
}
