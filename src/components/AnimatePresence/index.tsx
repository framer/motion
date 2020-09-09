import {
    useContext,
    useRef,
    isValidElement,
    cloneElement,
    Children,
    ReactElement,
    ReactNode,
} from "react"
import * as React from "react"
import { AnimatePresenceProps } from "./types"
import { useForceUpdate } from "../../utils/use-force-update"
import { PresenceChild } from "./PresenceChild"
import {
    SharedLayoutContext,
    isSharedLayout,
} from "../AnimateSharedLayout/SharedLayoutContext"

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

    children.forEach((child) => {
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
    Children.forEach(children, (child) => {
        if (isValidElement(child)) filtered.push(child)
    })

    return filtered
}

/**
 * `AnimatePresence` enables the animation of components that have been removed from the tree.
 *
 * When adding/removing more than a single child, every child **must** be given a unique `key` prop.
 *
 * @library
 *
 * Any `Frame` components that have an `exit` property defined will animate out when removed from
 * the tree.
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
 * You can sequence exit animations throughout a tree using variants.
 *
 * @motion
 *
 * Any `motion` components that have an `exit` property defined will animate out when removed from
 * the tree.
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
 * You can sequence exit animations throughout a tree using variants.
 *
 * If a child contains multiple `motion` components with `exit` props, it will only unmount the child
 * once all `motion` components have finished animating out. Likewise, any components using
 * `usePresence` all need to call `safeToRemove`.
 *
 * @public
 */
export const AnimatePresence: React.FunctionComponent<AnimatePresenceProps> = ({
    children,
    custom,
    initial = true,
    onExitComplete,
    exitBeforeEnter,
    presenceAffectsLayout = true,
}) => {
    // We want to force a re-render once all exiting animations have finished. We
    // either use a local forceRender function, or one from a parent context if it exists.
    let forceRender = useForceUpdate()
    const layoutContext = useContext(SharedLayoutContext)

    if (isSharedLayout(layoutContext)) {
        forceRender = layoutContext.forceUpdate
    }

    const isInitialRender = useRef(true)

    // Filter out any children that aren't ReactElements. We can only track ReactElements with a props.key
    const filteredChildren = onlyElements(children)

    // Keep a living record of the children we're actually rendering so we
    // can diff to figure out which are entering and exiting
    const presentChildren = useRef(filteredChildren)

    // A lookup table to quickly reference components by key
    const allChildren = useRef(new Map<ComponentKey, ReactElement<any>>())
        .current

    // A living record of all currently exiting components.
    const exiting = useRef(new Set<ComponentKey>()).current

    updateChildLookup(filteredChildren, allChildren)

    // If this is the initial component render, just deal with logic surrounding whether
    // we play onMount animations or not.
    if (isInitialRender.current) {
        isInitialRender.current = false

        return (
            <>
                {filteredChildren.map((child) => (
                    <PresenceChild
                        key={getChildKey(child)}
                        isPresent
                        initial={initial ? undefined : false}
                        presenceAffectsLayout={presenceAffectsLayout}
                    >
                        {child}
                    </PresenceChild>
                ))}
            </>
        )
    }

    // If this is a subsequent render, deal with entering and exiting children
    let childrenToRender = [...filteredChildren]

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

    // If we currently have exiting children, and we're deferring rendering incoming children
    // until after all current children have exiting, empty the childrenToRender array
    if (exitBeforeEnter && exiting.size) {
        childrenToRender = []
    }

    // Loop through all currently exiting components and clone them to overwrite `animate`
    // with any `exit` prop they might have defined.
    exiting.forEach((key) => {
        // If this component is actually entering again, early return
        if (targetKeys.indexOf(key) !== -1) return

        const child = allChildren.get(key)
        if (!child) return

        const insertionIndex = presentKeys.indexOf(key)

        const onExit = () => {
            allChildren.delete(key)
            exiting.delete(key)

            // Remove this child from the present children
            const removeIndex = presentChildren.current.findIndex(
                (presentChild) => presentChild.key === key
            )
            presentChildren.current.splice(removeIndex, 1)

            // Defer re-rendering until all exiting children have indeed left
            if (!exiting.size) {
                presentChildren.current = filteredChildren
                forceRender()
                onExitComplete && onExitComplete()
            }
        }

        childrenToRender.splice(
            insertionIndex,
            0,
            <PresenceChild
                key={getChildKey(child)}
                isPresent={false}
                onExitComplete={onExit}
                custom={custom}
                presenceAffectsLayout={presenceAffectsLayout}
            >
                {child}
            </PresenceChild>
        )
    })

    // Add `MotionContext` even to children that don't need it to ensure we're rendering
    // the same tree between renders
    childrenToRender = childrenToRender.map((child) => {
        const key = child.key as string | number
        return exiting.has(key) ? (
            child
        ) : (
            <PresenceChild
                key={getChildKey(child)}
                isPresent
                presenceAffectsLayout={presenceAffectsLayout}
            >
                {child}
            </PresenceChild>
        )
    })

    presentChildren.current = childrenToRender

    if (
        process.env.NODE_ENV !== "production" &&
        exitBeforeEnter &&
        childrenToRender.length > 1
    ) {
        console.warn(
            `You're attempting to animate multiple children within AnimatePresence, but its exitBeforeEnter prop is set to true. This will lead to odd visual behaviour.`
        )
    }

    return (
        <>
            {exiting.size
                ? childrenToRender
                : childrenToRender.map((child) => cloneElement(child))}
        </>
    )
}
