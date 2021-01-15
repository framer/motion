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
    style: ResolvedValues = {}

    /**
     * A record of styles we only want to apply via React. This gets set in useMotionValues
     * and applied in the render function. I'd prefer this to live somewhere else to decouple
     * VisualElement from React but works for now.
     */
    reactStyle: ResolvedValues = {}
    vars: ResolvedValues = {}

    /**
     * Presence data. This is hydrated by useDomVisualElement and used by AnimateSharedLayout
     * to decide how to animate entering/exiting layoutId
     */
    presence?: Presence
    isPresent?: boolean

    getBaseValue(key: string, props: MotionProps) {
        const style = props.style?.[key]
        return style !== undefined && !isMotionValue(style)
            ? style
            : super.getBaseValue(key, props)
    }

    /**
     * Optional id. If set, and this is the child of an AnimateSharedLayout component,
     * the targetBox can be transferred to a new component with the same ID.
     */
    layoutId?: string
    box: AxisBox2D

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
     * Record the bounding box as it exists before a re-render.
     */
    snapshotBoundingBox() {
        this.prevViewportBox = this.getBoundingBoxWithoutTransforms()

        /**
         * Update targetBox to match the prevViewportBox. This is just to ensure
         * that targetBox is affected by scroll in the same way as the measured box
         */
        this.rebaseProjectionTarget(false, this.prevViewportBox)
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
