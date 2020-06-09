import { HTMLVisualElement } from "./HTMLVisualElement"
import { buildSVGAttrs } from "./utils/build-svg-attrs"
import { Dimensions, HTMLVisualElementConfig } from "./types"
import { ResolvedValues } from "../types"
import { buildHTMLStyles } from "./utils/build-html-styles"

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

    render() {
        super.render()

        for (const key in this.attrs) {
            if (key !== "style") {
                this.element.setAttribute(key, this.attrs[key] as string)
            }
        }
    }

    build() {
        buildHTMLStyles(
            this.latest,
            this.attrs,
            this.vars,
            this.transform,
            this.transformOrigin,
            this.transformKeys,
            this.config
        )
        buildSVGAttrs(
            this.latest,
            this.style,
            this.attrs,
            this.dimensions,
            this.pathLength
        )
    }
}

function isPath(
    element: SVGElement | SVGPathElement
): element is SVGPathElement {
    return element.tagName === "path"
}
