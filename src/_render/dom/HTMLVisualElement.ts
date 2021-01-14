import { VisualElement } from "../VisualElement"
import { AxisBox2D, Point2D, BoxDelta } from "../../types/geometry"
import { delta, copyAxisBox, axisBox } from "../../utils/geometry"
import { ResolvedValues } from "../VisualElement/types"
import { buildHTMLStyles } from "./utils/build-html-styles"
import { DOMVisualElementConfig, TransformOrigin } from "./types"
import { isTransformProp } from "../../render/dom/utils/transform"
import { getDefaultValueType } from "../../render/dom/utils/value-types"
import {
    Presence,
    SharedLayoutAnimationConfig,
} from "../../components/AnimateSharedLayout/types"
import {
    resetBox,
    applyTreeDeltas,
    applyBoxTransforms,
    removeBoxTransforms,
} from "../../utils/geometry/delta-apply"
import { updateBoxDelta } from "../../utils/geometry/delta-calc"
import { TargetAndTransition, Transition } from "../../types"
import { eachAxis } from "../../utils/each-axis"
import { motionValue, MotionValue } from "../../value"
import { getBoundingBox } from "./layout/measure"
import {
    buildLayoutProjectionTransform,
    identityProjection,
} from "../../render/dom/utils/build-transform"
import { SubscriptionManager } from "../../utils/subscription-manager"
import { OnViewportBoxUpdate } from "../../motion/features/layout/types"
import sync from "framesync"
import { parseDomVariant } from "./utils/parse-dom-variant"
import { checkTargetForNewValues, getOrigin } from "../../render/utils/setters"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { MotionProps } from "../../motion"
import { isCSSVariable } from "../../render/dom/utils/is-css-variable"

export type LayoutUpdateHandler = (
    layout: AxisBox2D,
    prev: AxisBox2D,
    config?: SharedLayoutAnimationConfig
) => void

/**
 * A VisualElement for HTMLElements
 */
export class HTMLVisualElement<
    E extends HTMLElement | SVGElement = HTMLElement
> extends VisualElement<E> {
    /**
     *
     */
    protected defaultConfig: DOMVisualElementConfig = {
        enableHardwareAcceleration: true,
        allowTransformNone: true,
    }

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
     * Presence data. This is hydrated by useDomVisualElement and used by AnimateSharedLayout
     * to decide how to animate entering/exiting layoutId
     */
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

    config = this.defaultConfig

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

    addValue(key: string, value: MotionValue) {
        super.addValue(key, value)

        // If we have rotate values we want to foce the layoutOrigin used in layout projection
        // to the center of the element.
        if (key.startsWith("rotate")) this.layoutOrigin = 0.5
    }

    getBaseValue(key: string, props: MotionProps) {
        const style = props.style?.[key]
        return style !== undefined && !isMotionValue(style)
            ? style
            : super.getBaseValue(key, props)
    }

    /**
     * Ensure that HTML and Framer-specific value types like `px`->`%` and `Color`
     * can be animated by Motion.
     */
    makeTargetAnimatable(
        { transition, transitionEnd, ...target }: TargetAndTransition,
        parseDOMValues = true
    ): TargetAndTransition {
        const { transformValues } = this.config

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

        if (parseDOMValues) {
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

    /**
     * A set of layout update event handlers. These are only called once all layouts have been read,
     * making it safe to perform DOM write operations.
     */
    private layoutUpdateListeners = new SubscriptionManager<
        LayoutUpdateHandler
    >()

    private layoutMeasureListeners = new SubscriptionManager<
        LayoutUpdateHandler
    >()

    private viewportBoxUpdateListeners = new SubscriptionManager<
        OnViewportBoxUpdate
    >()
    private hasViewportBoxUpdated = false

    /**
     * Optional id. If set, and this is the child of an AnimateSharedLayout component,
     * the targetBox can be transferred to a new component with the same ID.
     */
    layoutId?: string
    box: AxisBox2D

    /**
     *
     */
    stopLayoutAxisAnimation = {
        x: () => {},
        y: () => {},
    }

    isVisible?: boolean

    hide() {
        if (this.isVisible === false) return
        this.isVisible = false
        this.scheduleRender()
    }

    show() {
        if (this.isVisible === true) return
        this.isVisible = true
        this.scheduleRender()
    }

    /**
     * Register an event listener to fire when the layout is updated. We might want to expose support
     * for this via a `motion` prop.
     */
    onLayoutUpdate(callback: LayoutUpdateHandler) {
        return this.layoutUpdateListeners.add(callback)
    }

    onLayoutMeasure(callback: LayoutUpdateHandler) {
        return this.layoutMeasureListeners.add(callback)
    }

    onViewportBoxUpdate(callback: OnViewportBoxUpdate) {
        return this.viewportBoxUpdateListeners.add(callback)
    }

    /**
     * To be called when all layouts are successfully updated. In turn we can notify layoutUpdate
     * subscribers.
     */
    layoutReady(config?: SharedLayoutAnimationConfig) {
        this.layoutUpdateListeners.notify(
            this.box,
            this.prevViewportBox || this.box,
            config
        )
    }

    /**
     * Measure and return the Element's bounding box. We convert it to a AxisBox2D
     * structure to make it easier to work on each individual axis generically.
     */
    getBoundingBox(): AxisBox2D {
        const { transformPagePoint } = this.config
        return getBoundingBox(this.element, transformPagePoint)
    }

    getBoundingBoxWithoutTransforms() {
        const bbox = this.getBoundingBox()
        removeBoxTransforms(bbox, this.latest)
        return bbox
    }

    /**
     * Return the computed style after a render.
     */
    getComputedStyle() {
        return window.getComputedStyle(this.element)
    }

    /**
     * Record the bounding box as it exists before a re-render.
     */
    snapshotBoundingBox() {
        this.prevViewportBox = this.getBoundingBoxWithoutTransforms()

        /**
         * Update targetBox to match the prevViewportBox. This is just to ensure
         * that targetBox is affected by scroll in the same way as the measured box
         */
        this.rebaseTargetBox(false, this.prevViewportBox)
    }

    rebaseTargetBox(force = false, box: AxisBox2D = this.box) {
        const { x, y } = this.getAxisProgress()
        const shouldRebase =
            this.box &&
            !this.isTargetBoxLocked &&
            !x.isAnimating() &&
            !y.isAnimating()

        if (force || shouldRebase) {
            eachAxis((axis) => {
                const { min, max } = box[axis]
                this.setAxisTarget(axis, min, max)
            })
        }
    }

    /**
     * The viewport scroll at the time of the previous layout measurement.
     */
    viewportScroll: Point2D

    measureLayout() {
        this.box = this.getBoundingBox()
        this.boxCorrected = copyAxisBox(this.box)

        if (!this.targetBox) this.targetBox = copyAxisBox(this.box)

        this.layoutMeasureListeners.notify(
            this.box,
            this.prevViewportBox || this.box
        )

        sync.update(() => this.rebaseTargetBox())
    }

    isTargetBoxLocked = false

    lockTargetBox() {
        this.isTargetBoxLocked = true
    }

    unlockTargetBox() {
        this.stopLayoutAnimation()
        this.isTargetBoxLocked = false
    }

    /**
     * Set new min/max boundaries to project an axis into
     */
    setAxisTarget(axis: "x" | "y", min: number, max: number) {
        const targetAxis = this.targetBox[axis]
        targetAxis.min = min
        targetAxis.max = max

        // Flag that we want to fire the onViewportBoxUpdate event handler
        this.hasViewportBoxUpdated = true

        this.rootParent.scheduleUpdateLayoutDelta()
    }

    private axisProgress?: MotionPoint
    getAxisProgress(): MotionPoint {
        if (!this.axisProgress) {
            this.axisProgress = {
                x: motionValue(0),
                y: motionValue(0),
            }
        }

        return this.axisProgress as MotionPoint
    }

    /**
     *
     */
    startLayoutAxisAnimation(axis: "x" | "y", transition: Transition) {
        const progress = this.getAxisProgress()[axis]

        const { min, max } = this.targetBox[axis]
        const length = max - min

        progress.clearListeners()
        progress.set(min)
        progress.set(min) // Set twice to hard-reset velocity
        progress.onChange((v) => this.setAxisTarget(axis, v, v + length))

        return this.animateMotionValue?.(axis, progress, 0, transition)
    }

    stopLayoutAnimation() {
        eachAxis((axis) => this.getAxisProgress()[axis].stop())
    }
}

/**
 * Pre-bound version of updateLayoutDelta so we're not creating a new function multiple
 * times per frame.
 */
const fireUpdateLayoutDelta = (child: VisualElement) =>
    child.updateLayoutDelta()

interface MotionPoint {
    x: MotionValue<number>
    y: MotionValue<number>
}
