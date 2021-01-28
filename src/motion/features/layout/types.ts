import { AxisBox2D, BoxDelta } from "../../../types/geometry"

export type OnViewportBoxUpdate = (box: AxisBox2D, delta: BoxDelta) => void

/**
 * @public
 */
export interface LayoutProps {
    /**
     * If `true`, this component will automatically animate to its new position when
     * its layout changes.
     *
     * ```jsx
     * <motion.div layout />
     * ```
     *
     * This will perform a layout animation using performant transforms. Part of this technique
     * involved animating an element's scale. This can introduce visual distortions on children,
     * `boxShadow` and `borderRadius`.
     *
     * To correct distortion on immediate children, add `layout` to those too.
     *
     * `boxShadow` and `borderRadius` will automatically be corrected if they are already being
     * animated on this component. Otherwise, set them directly via the `initial` prop.
     *
     * If `layout` is set to `"position"`, the size of the component will change instantly and
     * only its position will animate.
     *
     * @public
     */
    layout?: boolean | "position"

    /**
     * Enable shared layout transitions between components for children of `AnimateSharedLayout`.
     *
     * When a component with a layoutId is removed from the React tree, and then
     * added elsewhere, it will visually animate from the previous component's bounding box
     * and its latest animated values.
     *
     * ```jsx
     * <AnimateSharedLayout>
     *   {items.map(item => (
     *      <motion.li layout>
     *         {item.name}
     *         {item.isSelected && <motion.div layoutId="underline" />}
     *      </motion.li>
     *   ))}
     * </AnimateSharedLayout>
     * ```
     *
     * If the previous component remains in the tree it will either get hidden immediately or,
     * if `type="crossfade"` is set on `AnimateSharedLayout`, it will crossfade to the new component.
     *
     * @public
     */
    layoutId?: string

    /**
     * A callback that will fire when a layout animation on this component completes.
     *
     * @public
     */
    onLayoutAnimationComplete?(): void

    /**
     * TODO" Replace with lifecycles
     * A callback that fires whenever the viewport-relative bounding box updates.
     *
     * @public
     */
    onViewportBoxUpdate?(box: AxisBox2D, delta: BoxDelta): void

    /**
     * @internal
     */
    onLayoutMeasure?(box: AxisBox2D, prevBox: AxisBox2D): void
}
