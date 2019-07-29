/**
 * @public
 */
export interface AnimatePresenceProps {
    /**
     * By passing `initial={false}`, `AnimatePresence` will disable any initial animations on children
     * that are present when the component is first rendered.
     *
     * @library
     *
     * ```jsx
     * <AnimatePresence initial={false}>
     *   {isVisible && (
     *     <Frame
     *       key="modal"
     *       initial={{ opacity: 0 }}
     *       animate={{ opacity: 1 }}
     *       exit={{ opacity: 0 }}
     *     />
     *   )}
     * </AnimatePresence>
     * ```
     *
     * @motion
     *
     * ```jsx
     * <AnimatePresence initial={false}>
     *   {isVisible && (
     *     <motion.div
     *       key="modal"
     *       initial={{ opacity: 0 }}
     *       animate={{ opacity: 1 }}
     *       exit={{ opacity: 0 }}
     *     />
     *   )}
     * </AnimatePresence>
     * ```
     *
     * @public
     */
    initial?: boolean

    /**
     * When a component is removed, there's no longer a chance to update its props. So if a component's `exit`
     * prop is defined as a dynamic variant and you want to pass a new `custom` prop, you can do so via `AnimatePresence`.
     * This will ensure all leaving components animate using the latest data.
     *
     * @public
     */
    custom?: any

    /**
     * Fires when all exiting nodes have completed animating out.
     *
     * @public
     */
    onExitComplete?: () => void

    /**
     * `AnimatePresence` locally re-renders its children once exit animations are
     * complete. This means that if surrounding or parent components are also set to `positionTransition`,
     * they aren't informed of updates to the layout when they happen asynchronous to a render.
     *
     * This prop allows `AnimatePresence` to trigger re-renders at a higher level, so more
     * components can be made aware of the layout change and animate accordingly.
     *
     * In this example, the both the parent and sibling will animate to their new layout
     * once the div within `AnimatePresence` has finished animating:
     *
     * ```jsx
     * const MyComponent = ({ isVisible }) => {
     *   const forceRender = useForceRender() // Forces a set state or something
     *
     *   return (
     *     <motion.div positionTransition>
     *       <AnimatePresence _syncLayout={forceRender}>
     *         <motion.div positionTransition exit={{ opacity: 0 }} />
     *       </AnimatePresence>
     *       <motion.div positionTransition />
     *     </motion.div>
     *   )
     * }
     * ```
     *
     * In the final implementation `syncLayout` might be better as a component
     * that provides this function to children via context, or some other method
     * that obfuscates
     *
     * This isn't generally a problem for most use-cases but this capability will be useful
     * for advanced uses but also more so for phase 2 of `sizeTransition`, as we'd gain the power
     * to declaratively relayout entire parts of the page using only performant transforms.
     *
     * @internal
     */
    _syncLayout?: () => void

    /**
     * If set to `true`, `AnimatePresence` will only render one component at a time. The exiting component
     * will finished its exit animation before the entering component is rendered.
     *
     * @library
     *
     * ```jsx
     * function MyComponent({ currentItem }) {
     *   return (
     *     <AnimatePresence exitBeforeEnter>
     *       <Frame key={currentItem} exit={{ opacity: 0 }} />
     *     </AnimatePresence>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * const MyComponent = ({ currentItem }) => (
     *   <AnimatePresence exitBeforeEnter>
     *     <motion.div key={currentItem} exit={{ opacity: 0 }} />
     *   </AnimatePresence>
     * )
     * ```
     *
     * @beta
     */
    exitBeforeEnter?: boolean
}
