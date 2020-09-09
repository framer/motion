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

    /**
     * Used in Framer to flag that sibling children *shouldn't* re-render as a result of a
     * child being removed.
     *
     * @internal
     */
    presenceAffectsLayout?: boolean
}
