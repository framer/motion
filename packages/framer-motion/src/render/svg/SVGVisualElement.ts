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
import { createBox } from "../../projection/geometry/models"
import { IProjectionNode } from "../../projection/node/types"
import { isSVGTag } from "./utils/is-svg-tag"
import { VisualElement } from "../VisualElement"
import { isMotionValue } from "../../value/utils/is-motion-value"

export class SVGVisualElement extends DOMVisualElement<
    SVGElement,
    SVGRenderState,
    DOMVisualElementOptions
> {
    type = "svg"

    isSVGTag = false

    getBaseTargetFromProps(
        props: MotionProps,
        key: string
    ): string | number | MotionValue<any> | undefined {
        return props[key as keyof MotionProps]
    }

    readValueFromInstance(instance: SVGElement, key: string) {
        if (transformProps.has(key)) {
            const defaultType = getDefaultValueType(key)
            return defaultType ? defaultType.default || 0 : 0
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return instance.getAttribute(key)
    }

    measureInstanceViewportBox = createBox

    scrapeMotionValuesFromProps(
        props: MotionProps,
        prevProps: MotionProps,
        visualElement: VisualElement
    ) {
        return scrapeMotionValuesFromProps(props, prevProps, visualElement)
    }

    build(
        renderState: SVGRenderState,
        latestValues: ResolvedValues,
        props: MotionProps
    ) {
        buildSVGAttrs(
            renderState,
            latestValues,
            this.isSVGTag,
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

    mount(instance: SVGElement) {
        this.isSVGTag = isSVGTag(instance.tagName)
        super.mount(instance)
    }

    childSubscription?: VoidFunction
    handleChildMotionValue() {
        if (this.childSubscription) {
            this.childSubscription()
            delete this.childSubscription
        }

        const { children } = this.props
        if (isMotionValue(children)) {
            this.childSubscription = children.on("change", (latest) => {
                if (
                    this.current
                    && this.current.firstChild
                    && this.current.firstChild.nodeType === Node.TEXT_NODE
                ) {
                    // In SVG, the text can only be set through the value of the child text node
                    this.current.firstChild.nodeValue = `${latest}`
                }
            })
        }
    }
}
