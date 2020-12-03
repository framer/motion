import { HTMLVisualElement } from "./HTMLVisualElement"
import { buildSVGAttrs } from "./utils/build-svg-attrs"
import { Dimensions, DOMVisualElementConfig } from "./types"
import { ResolvedValues } from "../VisualElement/types"
import { camelCaseAttributes } from "./utils/svg-camel-case-attributes"
import { camelToDash } from "./utils/camel-to-dash"
import sync from "framesync"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { MotionProps } from "../../motion"

/**
 * A VisualElement for SVGElements. Inherits from and extends HTMLVisualElement as the two
 * share data structures.
 */
export class SVGVisualElement extends HTMLVisualElement<
    SVGElement | SVGPathElement
> {
    /**
     * A mutable record of attributes we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    attrs: ResolvedValues = {}

    /**
     * Measured dimensions of the SVG element to be used to calculate a transform-origin.
     */
    private dimensions: Dimensions

    /**
     * Measured path length if this is a SVGPathElement
     */
    private totalPathLength: number

    /**
     * We disable hardware acceleration for SVG transforms as they're not currently able to be accelerated.
     */
    protected defaultConfig: DOMVisualElementConfig = {
        enableHardwareAcceleration: false,
    }

    /**
     * Without duplicating this call from HTMLVisualElement we end up with HTMLVisualElement.defaultConfig
     * being assigned to config
     */
    config = this.defaultConfig

    /**
     * Measure the SVG element on mount. This can affect page rendering so there might be a
     * better time to perform this - for instance dynamically only if there's a transform-origin dependent
     * transform being set (like rotate)
     */
    protected mount(element: SVGElement) {
        super.mount(element)
        this.measure()
    }

    /**
     * Update the SVG dimensions and path length
     */
    private measure() {
        try {
            this.dimensions =
                typeof (this.element as SVGGraphicsElement).getBBox ===
                "function"
                    ? (this.element as SVGGraphicsElement).getBBox()
                    : (this.element.getBoundingClientRect() as DOMRect)
        } catch (e) {
            // Most likely trying to measure an unrendered element under Firefox
            this.dimensions = { x: 0, y: 0, width: 0, height: 0 }
        }

        if (isPath(this.element)) {
            this.totalPathLength = this.element.getTotalLength()
        }

        /**
         * Ensure we render the element as soon as possible to reflect the measured dimensions.
         * Preferably this would happen synchronously but we put it in rAF to prevent layout thrashing.
         */
        sync.render(() => this.render())
    }

    getBaseValue(key: string, props: MotionProps) {
        const prop = props[key]
        return prop !== undefined && !isMotionValue(prop)
            ? prop
            : super.getBaseValue(key, props)
    }

    /**
     * Empty the mutable data structures in case attrs have been removed between renders.
     */
    clean() {
        super.clean()
        this.attrs = {}
    }

    /**
     * Read an attribute directly from the SVGElement
     */
    read(key: string) {
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return this.element.getAttribute(key)
    }

    build() {
        this.updateTransformDeltas()

        buildSVGAttrs(
            this.latest,
            this.style,
            this.vars,
            this.attrs,
            this.transform,
            this.transformOrigin,
            this.transformKeys,
            this.config,
            this.dimensions,
            this.totalPathLength,
            this.isLayoutProjectionEnabled && !!this.box,
            this.delta,
            this.deltaFinal,
            this.treeScale,
            this.targetBoxFinal
        )
    }

    render() {
        // Update HTML styles and CSS variables
        super.render()

        // Loop through attributes and apply them to the SVGElement
        for (const key in this.attrs) {
            this.element.setAttribute(
                !camelCaseAttributes.has(key) ? camelToDash(key) : key,
                this.attrs[key] as string
            )
        }
    }
}

function isPath(
    element: SVGElement | SVGPathElement
): element is SVGPathElement {
    return element.tagName === "path"
}
