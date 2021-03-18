import { visualElement } from ".."
import { HTMLRenderState } from "./types"
import { VisualElementConfig } from "../types"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"
import { getBoundingBox } from "../dom/projection/measure"
import { DOMVisualElementOptions } from "../dom/types"
import { buildHTMLStyles } from "./utils/build-styles"
import { isCSSVariable } from "../dom/utils/is-css-variable"
import { parseDomVariant } from "../dom/utils/parse-dom-variant"
import { isTransformProp } from "./utils/transform"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { renderHTML } from "./utils/render"
import { getDefaultValueType } from "../dom/value-types/defaults"
import {
    buildLayoutProjectionTransform,
    buildLayoutProjectionTransformOrigin,
} from "./utils/build-projection-transform"

export function getComputedStyle(element: HTMLElement) {
    return window.getComputedStyle(element)
}

export const htmlConfig: VisualElementConfig<
    HTMLElement,
    HTMLRenderState,
    DOMVisualElementOptions
> = {
    treeType: "dom",

    readValueFromInstance(domElement, key) {
        if (isTransformProp(key)) {
            const defaultType = getDefaultValueType(key)
            return defaultType ? defaultType.default || 0 : 0
        } else {
            const computedStyle = getComputedStyle(domElement)
            return (
                (isCSSVariable(key)
                    ? computedStyle.getPropertyValue(key)
                    : computedStyle[key]) || 0
            )
        }
    },

    sortNodePosition(a, b) {
        /**
         * compareDocumentPosition returns a bitmask, by using the bitwise &
         * we're returning true if 2 in that bitmask is set to true. 2 is set
         * to true if b preceeds a.
         */
        return a.compareDocumentPosition(b) & 2 ? 1 : -1
    },

    getBaseTarget(props, key) {
        return props.style?.[key]
    },

    measureViewportBox(element, { transformPagePoint }) {
        return getBoundingBox(element, transformPagePoint)
    },

    /**
     * Reset the transform on the current Element. This is called as part
     * of a batched process across the entire layout tree. To remove this write
     * cycle it'd be interesting to see if it's possible to "undo" all the current
     * layout transforms up the tree in the same way this.getBoundingBoxWithoutTransforms
     * works
     */
    resetTransform(element, domElement, props) {
        /**
         * When we reset the transform of an element, there's a fair possibility that
         * the element will visually move from underneath the pointer, triggering attached
         * pointerenter/leave events. We temporarily suspend these while measurement takes place.
         */
        element.suspendHoverEvents()

        const { transformTemplate } = props
        domElement.style.transform = transformTemplate
            ? transformTemplate({}, "")
            : "none"

        // Ensure that whatever happens next, we restore our transform on the next frame
        element.scheduleRender()
    },

    restoreTransform(instance, mutableState) {
        instance.style.transform = mutableState.style.transform as string
    },

    removeValueFromRenderState(key, { vars, style }) {
        delete vars[key]
        delete style[key]
    },

    /**
     * Ensure that HTML and Framer-specific value types like `px`->`%` and `Color`
     * can be animated by Motion.
     */
    makeTargetAnimatable(
        element,
        { transition, transitionEnd, ...target },
        { transformValues },
        isMounted = true
    ) {
        let origin = getOrigin(target as any, transition || {}, element)

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
            checkTargetForNewValues(element, target, origin as any)
            const parsed = parseDomVariant(
                element,
                target,
                origin,
                transitionEnd
            )
            transitionEnd = parsed.transitionEnd
            target = parsed.target
        }

        return {
            transition,
            transitionEnd,
            ...target,
        }
    },

    scrapeMotionValuesFromProps,

    build(
        element,
        renderState,
        latestValues,
        projection,
        layoutState,
        options,
        props
    ) {
        if (element.isVisible !== undefined) {
            renderState.style.visibility = element.isVisible
                ? "visible"
                : "hidden"
        }

        const isProjectionTranform =
            projection.isEnabled && layoutState.isHydrated
        buildHTMLStyles(
            renderState,
            latestValues,
            projection,
            layoutState,
            options,
            props.transformTemplate,
            isProjectionTranform ? buildLayoutProjectionTransform : undefined,
            isProjectionTranform
                ? buildLayoutProjectionTransformOrigin
                : undefined
        )
    },

    render: renderHTML,
}

export const htmlVisualElement = visualElement(htmlConfig)
