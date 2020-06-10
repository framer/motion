import { HTMLVisualElement } from "./HTMLVisualElement"
import { buildSVGAttrs } from "./utils/build-svg-attrs"
import { Dimensions, HTMLVisualElementConfig } from "./types"
import { ResolvedValues } from "../types"
import { camelCaseAttributes } from "./utils/svg-camel-case-attributes"
import { camelToDash } from "./utils/camel-to-dash"

export class SVGVisualElement extends HTMLVisualElement<
    SVGElement | SVGPathElement
> {
    attrs: ResolvedValues = {}

    private dimensions: Dimensions
    private pathLength: number

    /**
     *
     */
    protected defaultConfig: HTMLVisualElementConfig = {
        enableHardwareAcceleration: false,
    }

    protected config = this.defaultConfig

    protected mount(element: SVGElement) {
        super.mount(element)
        this.measure()
    }

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
            this.pathLength = this.element.getTotalLength()
        }
    }

    clean() {
        super.clean()
        this.attrs = {}
    }

    read(key: string) {
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key
        return this.element.getAttribute(key)
    }

    build() {
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
            this.pathLength
        )
    }

    render() {
        super.render()

        for (const key in this.attrs) {
            this.element.setAttribute(key, this.attrs[key] as string)
        }
    }
}

function isPath(
    element: SVGElement | SVGPathElement
): element is SVGPathElement {
    return element.tagName === "path"
}
