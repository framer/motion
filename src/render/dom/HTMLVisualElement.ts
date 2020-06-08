import { VisualElement } from "../VisualElement"
import { BoundingBox2D } from "../../types/geometry"
import {
    convertBoundingBoxToAxisBox,
    transformBoundingBox,
} from "../../utils/geometry"
import { ResolvedValues } from "../types"
import { buildHTMLStyles } from "./utils/build-html-styles"
import { HTMLConfig, TransformOrigin } from "./types"
import { isTransformProp } from "./utils/transform"
import { getValueType } from "./utils/value-types"

export class HTMLVisualElement<
    E extends HTMLElement | SVGElement = HTMLElement
> extends VisualElement<E> {
    /**
     *
     */
    style: ResolvedValues = {}

    /**
     *
     */
    reactStyle: ResolvedValues = {}

    /**
     *
     */
    vars: ResolvedValues = {}

    /**
     *
     */
    protected config: HTMLConfig = {
        enableHardwareAcceleration: true,
    }

    /**
     *
     */
    private transform: ResolvedValues = {}

    /**
     *
     */
    private transformOrigin: TransformOrigin = {}

    /**
     *
     */
    private transformKeys: string[] = []

    /**
     * The measured bounding box as it exists on the page with no transforms applied.
     */
    //private measuredBox = axisBox()

    /**
     * The `measuredBox` layout as corrected for all the transforms being applied up the
     * tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    //private correctedBox = axisBox()

    /**
     * The visual target we want to project our component into on a given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    //private targetBox = axisBox()

    /**
     * The overall scale of the local coordinate system as transformed by all parents of this component. We use this
     * for scale correction on our calculated layouts and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    //private treeScale = { x: 1, y: 1 }

    removeValue(key: string) {
        super.removeValue(key)
        delete this.vars[key]
        delete this.style[key]
    }

    updateConfig({
        enableHardwareAcceleration = true,
        allowTransformNone = true,
        ...config
    }: HTMLConfig = {}) {
        this.config = {
            allowTransformNone,
            enableHardwareAcceleration,
            ...config,
        }
    }

    /**
     *
     */
    getBoundingBox() {
        const { transformPagePoint } = this.config

        let box = this.element.getBoundingClientRect() as BoundingBox2D
        box = transformBoundingBox(box, transformPagePoint)
        return convertBoundingBoxToAxisBox(box)
    }

    clean() {
        this.style = {}
        this.vars = {}
    }

    /**
     * Build a style prop using the latest resolved MotionValues
     */
    build() {
        // TODO: Add shadow bounding box resolution
        buildHTMLStyles(
            this.latest,
            this.style,
            this.vars,
            this.transform,
            this.transformOrigin,
            this.transformKeys,
            this.config
        )
    }

    readNativeValue(key: string) {
        if (isTransformProp(key)) {
            const defaultValueType = getValueType(key)
            return defaultValueType ? defaultValueType.default || 0 : 0
        } else {
            return this.getComputedStyle().getPropertyValue(key)
        }
    }

    getComputedStyle() {
        return window.getComputedStyle(this.getInstance())
    }

    /**
     *
     */
    render = () => {
        this.build()
        Object.assign(this.element.style, this.style)

        for (const key in this.vars) {
            this.element.style.setProperty(key, this.vars[key] as string)
        }
    }
}

// const axisBox = (): AxisBox2D => ({
//     x: { min: 0, max: 0 },
//     y: { min: 0, max: 0 },
// })
