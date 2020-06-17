import { VisualElement } from "../VisualElement"
import { BoundingBox2D, AxisBox2D } from "../../types/geometry"
import {
    convertBoundingBoxToAxisBox,
    transformBoundingBox,
    axisBox,
    copyAxisBox,
} from "../../utils/geometry"
import { ResolvedValues } from "../types"
import { buildHTMLStyles } from "./utils/build-html-styles"
import { DOMVisualElementConfig, TransformOrigin } from "./types"
import { isTransformProp } from "./utils/transform"
import { getDefaultValueType } from "./utils/value-types"
import { calcBoxDelta } from "../../motion/features/auto/utils"
import { BoxDelta } from "../../motion/features/auto/types"
import { MotionValue, motionValue } from "../../value"
import { startAnimation } from "../../animation/utils/transitions"

/**
 * A VisualElement for HTMLElements
 */
export class HTMLVisualElement<
    E extends HTMLElement | SVGElement = HTMLElement
> extends VisualElement<E> {
    /**
     * A mutable record of styles we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    style: ResolvedValues = {}

    /**
     * A record of styles we only want to apply via React. This gets set in useMotionValues
     * and applied in the render function. I'd prefer this to live somewhere else to decouple
     * VisualElement from React but works for now.
     */
    reactStyle: ResolvedValues = {}

    /**
     * A mutable record of CSS variables we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    vars: ResolvedValues = {}

    /**
     * A mutable record of transforms we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    protected transform: ResolvedValues = {}

    /**
     * A mutable record of transform origins we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    protected transformOrigin: TransformOrigin = {}

    /**
     * A mutable record of transform keys we want to apply to the rendered Element. We order
     * this to order transforms in the desired order. We use a mutable data structure to reduce GC during animations.
     */
    protected transformKeys: string[] = []

    protected defaultConfig: DOMVisualElementConfig = {
        enableHardwareAcceleration: true,
        allowTransformNone: true,
    }

    protected config = this.defaultConfig

    /**
     * The measured bounding box as it exists on the page with no transforms applied.
     *
     * If `layout` is `true`, or `layoutId` is defined, to calculate the visual output
     * of a component in any given frame, we:
     *
     *   1. layoutBox -> correctedLayoutBox
     *      Apply the delta between the tree transform when the layoutBox was measured and
     *      the tree transform in this frame to the layoutBox
     *   2. targetLayoutBox -> finalTargetBox
     *      Apply the VisualElement's `transform` properties to the targetLayoutBox
     *   3. Calculate the delta between correctedLayoutBox and finalTargetBox and apply
     *      it as a transform style.
     */
    private layoutBox = axisBox()

    /**
     * The `layoutBox` layout with transforms applied from up the
     * tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private correctedLayoutBox = axisBox()

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private targetLayoutBox: AxisBox2D

    /**
     * MotionValues that
     */
    private layout = {
        x: {
            translate: new MotionValue(0),
            scale: new MotionValue(1),
        },
        y: {
            translate: new MotionValue(0),
            scale: new MotionValue(1),
        },
    }

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private finalTargetBox = axisBox()

    /**
     * The overall scale of the local coordinate system as transformed by all parents
     * of this component. We use this for scale correction on our calculated layouts
     * and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private treeScale = { x: 1, y: 1 }

    private axisAnimation = {}

    /**
     *
     */
    private delta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
        isVisible: true,
    }

    /**
     * When a value is removed, we want to make sure it's removed from all rendered data structures.
     */
    removeValue(key: string) {
        super.removeValue(key)
        delete this.vars[key]
        delete this.style[key]
    }

    /**
     * Empty the mutable data structures by re-creating them. We can do this every React render
     * as the comparative workload to the rest of the render is very low and this is also when
     * we want to reflect values that might have been removed by the render.
     */
    clean() {
        this.style = {}
        this.vars = {}
        this.transform = {}
    }

    updateConfig(config: DOMVisualElementConfig = {}) {
        this.config = { ...this.defaultConfig, ...config }
    }

    /**
     * Measure and return the Element's bounding box. We convert it to a AxisBox2D
     * structure to make it easier to work on each individual axis generically.
     */
    getBoundingBox(): AxisBox2D {
        const { transformPagePoint } = this.config

        let box = this.element.getBoundingClientRect() as BoundingBox2D
        box = transformBoundingBox(box, transformPagePoint)
        return convertBoundingBoxToAxisBox(box)
    }

    /**
     * Read a value directly from the HTMLElement style.
     */
    read(key: string): number | string | null {
        return this.getComputedStyle()[key] || 0
    }

    /**
     * Read a value directly from the HTMLElement in case it's not defined by a Motion
     * prop. If it's a transform, we just return a pre-defined default value as reading these
     * out of a matrix is either error-prone or can incur a big payload for little benefit.
     */
    readNativeValue(key: string) {
        if (isTransformProp(key)) {
            const defaultValueType = getDefaultValueType(key)
            return defaultValueType ? defaultValueType.default || 0 : 0
        } else {
            return this.read(key)
        }
    }

    /**
     * Return the computed style after a render.
     */
    getComputedStyle() {
        return window.getComputedStyle(this.getInstance())
    }

    /**
     *
     */
    updateLayoutBox() {
        const bbox = this.getBoundingBox()
        this.layoutBox = bbox

        if (!this.targetLayoutBox) {
            this.targetLayoutBox = copyAxisBox(bbox)
        }
    }

    setAxisTarget(axis: "x" | "y", min: number, max: number) {
        this.targetLayoutBox[axis].min = min
        this.targetLayoutBox[axis].max = max
        this.scheduleRender()
    }

    getTargetLayoutBox() {
        return this.targetLayoutBox
    }

    enableLayoutAware() {
        this.isLayoutAware = true
    }

    // TODO Move all this layout stuff to a WeakMap-bound class
    startAxisTranslateAnimation(axis: "x" | "y", transition: Transition) {
        this.stopAxisAnimation(axis)

        const axisData = this.targetLayoutBox[axis]
        const min = motionValue(axisData.min)
        const length = axisData.max - axisData.min

        startAnimation(axis, min, 0, transition)

        min.onChange(v => {
            axisData.min = v
            axisData.max = v + length
            this.scheduleRender()
        })

        this.axisAnimation[axis] = min
    }

    stopAxisAnimation(axis: "x" | "y") {
        if (this.axisAnimation[axis]) {
            this.axisAnimation[axis].stop()
        }
    }

    /**
     * Build a style prop using the latest resolved MotionValues
     */
    build() {
        if (this.isLayoutAware) {
            calcBoxDelta(this.delta, this.targetLayoutBox, this.layoutBox, 0.5)

            // this.setStaticValues("originX", dx.origin)
            // this.setStaticValues("originY", dy.origin)
            const dx = this.delta.x
            const dy = this.delta.y
            this.config.transformTemplate = (_, gen) => {
                return `scaleX(${dx.scale}) scaleY(${dy.scale}) translate(${dx.translate}px, ${dy.translate}px) ${gen}`
            }

            /**
             * 1. Apply animation to target layout
             * 2. Stop animation on target layout on mouse down
             * 3.
             */
        }

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

    /**
     * Render the Element by rebuilding and applying the latest styles and vars.
     */
    render() {
        // Rebuild the latest animated values into style and vars caches.
        this.build()

        // Directly assign style into the Element's style prop. In tests Object.assign is the
        // fastest way to assign styles.
        Object.assign(this.element.style, this.style)

        // Loop over any CSS variables and assign those.
        for (const key in this.vars) {
            this.element.style.setProperty(key, this.vars[key] as string)
        }
    }
}

const zeroDelta = {
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}
