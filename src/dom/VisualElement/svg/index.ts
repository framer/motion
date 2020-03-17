import {
    MountedVisualElement,
    BoundingBox,
    Styles,
    VisualElementOptions,
} from "../types"
import { camelCaseAttributes, createBuildSVGAttrs } from "./attrs"
import { isTransformProp } from "../utils/transform"
import { getValueType } from "../../value-types"
import { camelToDash } from "../../../utils/camel-to-dash"

export class SVGVisualElement implements MountedVisualElement {
    readonly element: SVGElement | SVGGraphicsElement
    readonly buildAttrs: (
        styles: Styles,
        opts: VisualElementOptions,
        dimensions: BoundingBox,
        pathLength: number
    ) => Styles

    styles: Styles = {}
    dimensions: BoundingBox
    pathLength: number = 0

    constructor(element: SVGElement) {
        this.element = element
        this.dimensions = this.getBoundingBox() // Ensure this is correct with paths

        if (element.tagName === "path") {
            this.pathLength = (element as SVGPathElement).getTotalLength()
        }

        this.buildAttrs = createBuildSVGAttrs()
    }

    setStyle(key: string, value: string | number) {
        this.styles[key] = value
    }

    readStyle(key: string) {
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key

        if (!isTransformProp(key)) {
            return this.element.getAttribute(key)
        } else {
            const valueType = getValueType(key)
            return valueType ? valueType.default || 0 : 0
        }
    }

    getComputedStyle() {
        return window.getComputedStyle(this.element)
    }

    getBoundingBox() {
        const hasBBox =
            typeof (this.element as SVGGraphicsElement).getBBox === "function"

        if (hasBBox) {
            return (this.element as SVGGraphicsElement).getBBox()
        } else {
            return this.element.getBoundingClientRect()
        }
    }

    render(options: VisualElementOptions) {
        options.enableHardwareAcceleration = false
        const attrs = this.buildAttrs(
            this.styles,
            options,
            this.dimensions,
            this.pathLength
        )

        for (const key in attrs) {
            if (key === "style") {
                Object.assign(this.element.style, attrs.style)
            } else {
                this.element.setAttribute(key, attrs[key] as string)
            }
        }
    }
}
