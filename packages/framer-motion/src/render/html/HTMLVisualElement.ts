import { HTMLRenderState } from "./types"
import { DOMVisualElementOptions } from "../dom/types"
import { buildHTMLStyles } from "./utils/build-styles"
import { isCSSVariableName } from "../dom/utils/is-css-variable"
import { transformProps } from "./utils/transform"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { renderHTML } from "./utils/render"
import { getDefaultValueType } from "../dom/value-types/defaults"
import { measureViewportBox } from "../../projection/utils/measure"
import { MotionProps, MotionStyle } from "../../motion/types"
import { Box } from "../../projection/geometry/types"
import { DOMVisualElement } from "../dom/DOMVisualElement"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { isMotionValue } from "../../value/utils/is-motion-value"
import type { ResolvedValues, VisualElementOptions } from "../types"
import type { IProjectionNode } from "../../projection/node/types"
import { VisualElement } from "../VisualElement"
import { WillChangeMotionValue } from "../../value/use-will-change"

export function getComputedStyle(element: HTMLElement) {
    return window.getComputedStyle(element)
}

export class HTMLVisualElement extends DOMVisualElement<
    HTMLElement,
    HTMLRenderState,
    DOMVisualElementOptions
> {
    type = "html"

    constructor(
        genericOptions: VisualElementOptions<HTMLElement, HTMLRenderState>,
        domOptions?: DOMVisualElementOptions
    ) {
        super(genericOptions, domOptions)

        this.addValue(
            "willChange",
            new WillChangeMotionValue(this.latestValues.willChange || "auto")
        )
    }

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
                (isCSSVariableName(key)
                    ? computedStyle.getPropertyValue(key)
                    : computedStyle[key as keyof typeof computedStyle]) || 0

            return typeof value === "string" ? value.trim() : (value as number)
        }
    }

    measureInstanceViewportBox(
        instance: HTMLElement,
        { transformPagePoint }: MotionProps & Partial<MotionConfigContext>
    ): Box {
        return measureViewportBox(instance, transformPagePoint)
    }

    build(
        renderState: HTMLRenderState,
        latestValues: ResolvedValues,
        props: MotionProps
    ) {
        buildHTMLStyles(renderState, latestValues, props.transformTemplate)
    }

    scrapeMotionValuesFromProps(
        props: MotionProps,
        prevProps: MotionProps,
        visualElement: VisualElement
    ) {
        return scrapeMotionValuesFromProps(props, prevProps, visualElement)
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
                if (this.current) this.current.textContent = `${latest}`
            })
        }
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
