import { HTMLRenderState } from "./types"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"
import { DOMVisualElementOptions } from "../dom/types"
import { buildHTMLStyles } from "./utils/build-styles"
import { isCSSVariable } from "../dom/utils/is-css-variable"
import { parseDomVariant } from "../dom/utils/parse-dom-variant"
import { transformProps } from "./utils/transform"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { renderHTML } from "./utils/render"
import { getDefaultValueType } from "../dom/value-types/defaults"
import { measureViewportBox } from "../../projection/utils/measure"
import { VisualElement } from "../VisualElement"
import { MotionProps, MotionStyle } from "../../motion/types"
import { MotionValue } from "../../value"
import { MotionConfigProps } from "../../components/MotionConfig"
import { Box } from "../../projection/geometry/types"
import { IProjectionNode, ResolvedValues, TargetAndTransition } from "../.."

export function getComputedStyle(element: HTMLElement) {
    return window.getComputedStyle(element)
}

export abstract class DOMVisualElement<
    Instance extends HTMLElement | SVGElement = HTMLElement,
    State extends HTMLRenderState = HTMLRenderState,
    Options extends DOMVisualElementOptions = DOMVisualElementOptions
> extends VisualElement<Instance, State, Options> {
    sortInstanceNodePosition(a: Instance, b: Instance): number {
        /**
         * compareDocumentPosition returns a bitmask, by using the bitwise &
         * we're returning true if 2 in that bitmask is set to true. 2 is set
         * to true if b preceeds a.
         */
        return a.compareDocumentPosition(b) & 2 ? 1 : -1
    }

    getBaseTargetFromInstance(
        props: MotionProps,
        key: string
    ): string | number | MotionValue<any> | undefined {
        return props.style?.[key]
    }

    removeValueFromRenderState(
        key: string,
        { vars, style }: HTMLRenderState
    ): void {
        delete vars[key]
        delete style[key]
    }

    makeTargetAnimatableFromInstance(
        { transition, transitionEnd, ...target }: TargetAndTransition,
        { transformValues }: MotionProps,
        isMounted: boolean
    ): TargetAndTransition {
        let origin = getOrigin(target as any, transition || {}, this)

        /**
         * If Framer has provided a function to convert `Color` etc value types, convert them
         */
        if (transformValues) {
            if (transitionEnd)
                transitionEnd = transformValues(transitionEnd as any)
            if (target) target = transformValues(target as any)
            if (origin) origin = transformValues(origin as any)
        }

        if (isMounted) {
            checkTargetForNewValues(this, target, origin as any)
            const parsed = parseDomVariant(this, target, origin, transitionEnd)
            transitionEnd = parsed.transitionEnd
            target = parsed.target
        }

        return {
            transition,
            transitionEnd,
            ...target,
        }
    }
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
        if (this.isVisible !== undefined) {
            renderState.style.visibility = this.isVisible ? "visible" : "hidden"
        }

        buildHTMLStyles(
            renderState,
            latestValues,
            options,
            props.transformTemplate
        )
    }

    scrapeMotionValuesFromProps(props: MotionProps) {
        return scrapeMotionValuesFromProps(props)
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
