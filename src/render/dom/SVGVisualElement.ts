import { HTMLVisualElement } from "./HTMLVisualElement"
import { buildSVGProps } from "./utils/build-svg-props"
import { Dimensions } from "./types"

export class SVGVisualElement extends HTMLVisualElement<SVGElement> {
    private dimensions: Dimensions

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
            // most likely trying to measure an unrendered element under Firefox
            this.dimensions = { x: 0, y: 0, width: 0, height: 0 }
        }
    }

    build() {
        super.build()
        buildSVGProps(this.latest, this.style)
    }
}

this.latest,
    this.style,
    this.vars,
    this.transform,
    this.transformOrigin,
    this.transformKeys,
    this.config
