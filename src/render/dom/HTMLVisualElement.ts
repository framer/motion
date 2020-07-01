import { VisualElement } from "../VisualElement"
import { BoundingBox2D, Axis, AxisBox2D, Point2D } from "../../types/geometry"
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
import { BoxDelta } from "../../motion/features/auto/types"
import { MotionValue, motionValue } from "../../value"
import { startAnimation } from "../../animation/utils/transitions"
import {
    updateAxisDelta,
    removeBoxDelta,
    resetBox,
    applyTreeDeltas,
    updateBoxDelta,
    scalePoint,
} from "./layout/utils"
import { eachAxis } from "../../utils/each-axis"
import { Presence } from "../../components/AnimateSharedLayout/types"
import { mix } from "@popmotion/popcorn"

type LayoutCallback = (layoutBox: AxisBox2D, prevViewportBox: AxisBox2D) => void

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
     *
     * TODO Move all layout related stuff to a VisualElementLayout class linked via WeakMap
     */
    layoutId?: string
    presence?: Presence
    isPresent?: boolean

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
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private finalTargetBox = axisBox()

    private isLayoutAware = false

    prevViewportBox?: AxisBox2D

    /**
     * The overall scale of the local coordinate system as transformed by all parents
     * of this component. We use this for scale correction on our calculated layouts
     * and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private treeScale: Point2D = { x: 1, y: 1 }

    private axisAnimation = {}

    targetLayoutDelta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }

    delta: BoxDelta = {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }

    private isVisible = true

    snapshot() {
        this.prevViewportBox = this.getBoundingBox()
        undoTransforms(this.prevViewportBox, this.values)
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
        return window.getComputedStyle(this.element)
    }

    resetTransform() {
        this.element.style.transform = "none"
    }

    /**
     *
     */
    measureLayout() {
        const bbox = this.getBoundingBox()

        this.layoutBox = bbox

        if (!this.targetLayoutBox || !this.isTargetBoxLocked) {
            this.targetLayoutBox = copyAxisBox(bbox)
        }

        this.updateTargetBox("x")
        this.updateTargetBox("y")
    }

    // DO this but less crap
    lockTargetBox() {
        this.isTargetBoxLocked = true
    }

    unlockTargetBox() {
        this.isTargetBoxLocked = false
    }

    setAxisTarget(axis: "x" | "y", min: number, max: number) {
        // TODO Remove this
        if (!this.targetLayoutBox) return
        const targetAxis = this.targetLayoutBox[axis]
        targetAxis.min = min
        targetAxis.max = max

        this.scheduleRender()
        this.scheduleChildrenRender()
        //this.updateTargetBox(axis)
    }

    updateTargetBox(axis: "x" | "y") {
        updateAxisDelta(
            this.delta[axis],
            this.layoutBox[axis],
            this.targetLayoutBox[axis]
        )

        const value = this.getValue(axis)
        value && value!.set(this.delta[axis].translate)
    }

    getTargetLayoutBox() {
        return this.targetLayoutBox
    }

    enableLayoutAware() {
        this.isLayoutAware = true

        this.targetLayoutBox = copyAxisBox(this.layoutBox)
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

    updateDelta() {
        // TODO REplace this with batching
        this.treePath.forEach(p => p.updateDelta())

        resetBox(this.correctedLayoutBox, this.layoutBox)
        applyTreeDeltas(
            this.correctedLayoutBox,
            this.treeScale,
            this.treePath as any
        )

        applyLocalTransforms(
            this.finalTargetBox,
            this.targetLayoutBox,
            this.values
        )

        updateBoxDelta(
            this.targetLayoutDelta,
            this.correctedLayoutBox,
            this.targetLayoutBox
        )
        updateBoxDelta(this.delta, this.correctedLayoutBox, this.finalTargetBox)
    }

    private layoutReadyListeners: Set<LayoutCallback> = new Set()

    layoutReady() {
        this.layoutReadyListeners.forEach(listener => {
            listener(this.layoutBox, this.prevViewportBox || this.layoutBox)
        })
    }

    onLayoutReady(callback: LayoutCallback) {
        this.layoutReadyListeners.add(callback)
        return () => this.layoutReadyListeners.delete(callback)
    }

    /**
     * Build a style prop using the latest resolved MotionValues
     */
    build() {
        if (this.isLayoutAware && this.targetLayoutBox) {
            this.updateDelta()
        }

        // TODO: Add shadow bounding box resolution
        buildHTMLStyles(
            this.latest,
            this.style,
            this.vars,
            this.transform,
            this.transformOrigin,
            this.transformKeys,
            this.config,
            this.isLayoutAware,
            this.targetLayoutDelta,
            this.delta,
            this.treeScale,
            this.targetLayoutBox
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

function undoScalePoint(
    point: number,
    scale: number,
    originPoint: number
): number {
    const distanceFromOrigin = point - originPoint
    const scaled = distanceFromOrigin / scale
    return originPoint + scaled
}

function undoTransformOnAxis(
    axis: Axis,
    boxScale: number = 1,
    scale: number = 1,
    translate: number = 0,
    origin: number = 0.5
) {
    axis.min -= translate
    axis.max -= translate

    const axisScaleOriginPoint = mix(axis.min, axis.max, origin)
    axis.min = undoScalePoint(axis.min, scale, axisScaleOriginPoint)
    axis.max = undoScalePoint(axis.max, scale, axisScaleOriginPoint)

    // TODO This is probably the same as before
    const boxScaleOriginPoint = mix(axis.min, axis.max, origin)
    axis.min = undoScalePoint(axis.min, boxScale, boxScaleOriginPoint)
    axis.max = undoScalePoint(axis.max, boxScale, boxScaleOriginPoint)
}

function undoTransforms(bbox: AxisBox2D, values: MotionValueMap) {
    undoTransformOnAxis(
        bbox.x,
        values.get("scale")?.get(),
        values.get("scaleX")?.get(),
        values.get("x")?.get(),
        values.get("originX")?.get()
    )
    undoTransformOnAxis(
        bbox.y,
        values.get("scale")?.get(),
        values.get("scaleY")?.get(),
        values.get("y")?.get(),
        values.get("originY")?.get()
    )
}

function applyScaleToPoint(
    point: number,
    originPoint: number,
    scale: number
): number {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

function applyTransformToAxis(
    finalAxis: Axis,
    targetBbox: Axis,
    boxScale: number = 1,
    scale: number = 1,
    translate: number = 0,
    origin: number = 0.5
) {
    finalAxis.min = targetBbox.min
    finalAxis.max = targetBbox.max

    const originPoint = mix(finalAxis.min, finalAxis.max, origin)
    finalAxis.min = applyScaleToPoint(finalAxis.min, originPoint, boxScale)
    finalAxis.max = applyScaleToPoint(finalAxis.max, originPoint, boxScale)
    finalAxis.min = applyScaleToPoint(finalAxis.min, originPoint, scale)
    finalAxis.max = applyScaleToPoint(finalAxis.max, originPoint, scale)
    finalAxis.min += translate
    finalAxis.max += translate
}

// TODO: Consolidate with utils
function applyLocalTransforms(
    finalBbox: AxisBox2D,
    targetBbox: AxisBox2D,
    values: MotionValueMap
) {
    applyTransformToAxis(
        finalBbox.x,
        targetBbox.x,
        values.get("scale")?.get(),
        values.get("scaleX")?.get(),
        values.get("x")?.get(),
        values.get("originX")?.get()
    )
    applyTransformToAxis(
        finalBbox.y,
        targetBbox.y,
        values.get("scale")?.get(),
        values.get("scaleY")?.get(),
        values.get("y")?.get(),
        values.get("originY")?.get()
    )
}
