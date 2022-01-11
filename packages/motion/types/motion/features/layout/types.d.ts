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
     * only its position will animate. If `layout` is set to `"size"`, the position of the
     * component will change instantly but its size will animate.
     *
     * If `layout` is set to `"size"`, the position of the component will change instantly and
     * only its size will animate.
     *
     * @public
     */
    layout?: boolean | "position" | "size";
    /**
     * Enable shared layout transitions between different components with the same `layoutId`.
     *
     * When a component with a layoutId is removed from the React tree, and then
     * added elsewhere, it will visually animate from the previous component's bounding box
     * and its latest animated values.
     *
     * ```jsx
     *   {items.map(item => (
     *      <motion.li layout>
     *         {item.name}
     *         {item.isSelected && <motion.div layoutId="underline" />}
     *      </motion.li>
     *   ))}
     * ```
     *
     * If the previous component remains in the tree it will crossfade with the new component.
     *
     * @public
     */
    layoutId?: string;
    /**
     * A callback that will fire when a layout animation on this component completes.
     *
     * @public
     */
    onLayoutAnimationComplete?(): void;
    /**
     * @public
     */
    layoutDependency?: any;
    /**
     * Wether a projection node should measure its scroll when it or its descendants update their layout.
     *
     * @public
     */
    layoutScroll?: boolean;
}
