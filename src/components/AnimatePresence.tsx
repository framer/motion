import {
    useState,
    useRef,
    isValidElement,
    cloneElement,
    Children,
    ReactElement,
    ReactNode,
    FunctionComponent,
} from "react"
import * as React from "react"

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
}

type ComponentKey = string | number

function getChildKey(child: ReactElement<any>): ComponentKey {
    return child.key || ""
}

function updateChildLookup(
    children: ReactElement<any>[],
    allChildren: Map<ComponentKey, ReactElement<any>>
) {
    const seenChildren =
        process.env.NODE_ENV !== "production" ? new Set<ComponentKey>() : null

    children.forEach(child => {
        const key = getChildKey(child)

        if (process.env.NODE_ENV !== "production" && seenChildren) {
            if (seenChildren.has(key)) {
                console.warn(
                    `Children of AnimatePresence require unique keys. "${key}" is a duplicate.`
                )
            }

            seenChildren.add(key)
        }

        allChildren.set(key, child)
    })
}

function onlyElements(children: ReactNode): ReactElement<any>[] {
    const filtered: ReactElement<any>[] = []

    // We use forEach here instead of map as map mutates the component key by preprending `.$`
    Children.forEach(children, child => {
        if (isValidElement(child)) filtered.push(child)
    })

    return filtered
}

/**
 * The `AnimatePresence` component enables the use of the `exit` prop to animate components
 * when they're removed from the component tree.
 *
 * When adding/removing more than a single child component, every component
 * **must** be given a unique `key` prop.
 *
 * @library
 *
 * The immediate children of `AnimatePresence` should be components that accept `animate`, `exit`
 * and `onAnimationComplete` props, like `Frame`.
 *
 * ```jsx
 * import { Frame, AnimatePresence } from 'framer'
 *
 * // As items are added and removed from `items`
 * export function Items({ items }) {
 *   return (
 *     <AnimatePresence>
 *       {items.map(item => (
 *         <Frame
 *           key={item.id}
 *           initial={{ opacity: 0 }}
 *           animate={{ opacity: 1 }}
 *           exit={{ opacity: 0 }}
 *         />
 *       ))}
 *     </AnimatePresence>
 *   )
 * }
 * ```
 *
 * You can use custom components, as long as you ensure to forward `animate` and `onAnimationComplete`.
 *
 * @motion
 *
 * The immediate children of `AnimatePresence` should be `motion` components. You can use custom components,
 * as long as you ensure to forward `animate` and `onAnimationComplete` to the top-level `motion` component.
 *
 * ```jsx
 * import { motion, AnimatePresence } from 'framer-motion'
 *
 * export const Items = ({ items }) => (
 *   <AnimatePresence>
 *     {items.map(item => (
 *       <motion.div
 *         key={item.id}
 *         initial={{ opacity: 0 }}
 *         animate={{ opacity: 1 }}
 *         exit={{ opacity: 0 }}
 *       />
 *     ))}
 *   </AnimatePresence>
 * )
 * ```
 *
 * @public
 */
export const AnimatePresence: FunctionComponent<AnimatePresenceProps> = ({
    children,
    custom,
    initial = true,
    onExitComplete,
}) => {
    const isInitialRender = useRef(true)

    // Filter out any children that aren't ReactElements. We can only track ReactElements with a props.key
    const filteredChildren = onlyElements(children)

    // Keep a living record of the children we're actually rendering so we
    // can diff to figure out which are entering and exiting
    const presentChildren = useRef(filteredChildren)

    // A lookup table to quickly reference components by key
    const allChildren = useRef(new Map<ComponentKey, ReactElement<any>>())
        .current

    // Use a running state counter to allow us to force a re-render once all
    // exiting animations have settled. For performance reasons it might also be
    // necessary to track entering animations too, but this should be good enough
    // for the majority use-cases ie slideshows, modals etc.
    const [forcedRenderCount, setForcedRenderCount] = useState(0)

    // A living record of all currently exiting components.
    const exiting = useRef(new Set<ComponentKey>()).current

    updateChildLookup(filteredChildren, allChildren)

    // If this is the initial component render, just deal with logic surrounding whether
    // we play onMount animations or not.
    if (isInitialRender.current) {
        isInitialRender.current = false

        // If `initial` is `true`, return child unaltered to carry out their individually-defined behaviour.
        if (initial) return <>{filteredChildren}</>

        // Otherwise, suppress mount animations by setting `initial: false` on all children.
        return (
            <>
                {filteredChildren.map(child =>
                    cloneElement(child, { initial: false })
                )}
            </>
        )
    }

    // If this is a subsequent render, deal with entering and exiting children
    const childrenToRender = [...filteredChildren]

    // Diff the keys of the currently-present and target children to update our
    // exiting list.
    const presentKeys = presentChildren.current.map(getChildKey)
    const targetKeys = filteredChildren.map(getChildKey)

    // Diff the present children with our target children and mark those that are exiting
    const numPresent = presentKeys.length
    for (let i = 0; i < numPresent; i++) {
        const key = presentKeys[i]
        if (targetKeys.indexOf(key) === -1) {
            exiting.add(key)
        } else {
            // In case this key has re-entered, remove from the exiting list
            exiting.delete(key)
        }
    }

    // Loop through all currently exiting components and clone them to overwrite `animate`
    // with any `exit` prop they might have defined.
    exiting.forEach(key => {
        // If this component is actually entering again, early return
        if (targetKeys.indexOf(key) !== -1) return

        const child = allChildren.get(key)
        if (!child) return

        const { animate, exit, onAnimationComplete } = child.props
        const props = typeof custom !== "undefined" ? { custom } : {}
        const insertionIndex = presentKeys.indexOf(key)

        childrenToRender.splice(
            insertionIndex,
            0,
            cloneElement(child, {
                ...props,
                animate: exit || animate,
                onAnimationComplete: () => {
                    exiting.delete(key)

                    // Remove this child from the present children
                    const removeIndex = presentChildren.current.findIndex(
                        child => child.key === key
                    )
                    presentChildren.current.splice(removeIndex, 1)
                    onAnimationComplete && onAnimationComplete()

                    // Defer re-rendering until all exiting children have indeed left
                    if (!exiting.size) {
                        presentChildren.current = filteredChildren
                        setForcedRenderCount(forcedRenderCount + 1)
                        onExitComplete && onExitComplete()
                    }
                },
            })
        )
    })

    presentChildren.current = childrenToRender

    return (
        <>
            {exiting.size
                ? childrenToRender
                : childrenToRender.map(child => cloneElement(child))}
        </>
    )
}
