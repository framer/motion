import {
    useRef,
    isValidElement,
    cloneElement,
    Children,
    ReactElement,
    ReactNode,
    useContext,
} from "react"
import * as React from "react"
import { env } from "../../utils/process"
import { AnimatePresenceProps } from "./types"
import { useForceUpdate } from "../../utils/use-force-update"
import { useIsMounted } from "../../utils/use-is-mounted"
import { PresenceChild } from "./PresenceChild"
import { LayoutGroupContext } from "../../context/LayoutGroupContext"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { useUnmountEffect } from "../../utils/use-unmount-effect"
import { warnOnce } from "../../utils/warn-once"

type ComponentKey = string | number

const getChildKey = (child: ReactElement<any>): ComponentKey => child.key || ""

function updateChildLookup(
    children: ReactElement<any>[],
    allChildren: Map<ComponentKey, ReactElement<any>>
) {
    children.forEach((child) => {
        const key = getChildKey(child)
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

function splitChildrenByKeys(
    keys: ComponentKey[],
    children: ReactElement<any>[],
    mapFunction?: (child: ReactElement<any>) => ReactElement<any>
): ReactElement<any>[][] {
    const chunks: ReactElement<any>[][] = []
    let insertionStartIndex = 0

    keys.forEach((key) => {
        const insertionEndIndex = children.findIndex(
            (child) => getChildKey(child) === key
        )

        let chunk = children.slice(insertionStartIndex, insertionEndIndex)
        if (mapFunction) chunk = chunk.map(mapFunction)
        chunks.push(chunk)
        insertionStartIndex = insertionEndIndex + 1
    })

    let chunk = children.slice(insertionStartIndex, children.length)
    if (mapFunction) chunk = chunk.map(mapFunction)
    chunks.push(chunk)

    return chunks
}

/**
 * `AnimatePresence` enables the animation of components that have been removed from the tree.
 *
 * When adding/removing more than a single child, every child **must** be given a unique `key` prop.
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
export const AnimatePresence: React.FunctionComponent<
    React.PropsWithChildren<AnimatePresenceProps>
> = ({
    children,
    custom,
    initial = true,
    onExitComplete,
    exitBeforeEnter,
    presenceAffectsLayout = true,
    mode = "sync",
}) => {
    // Support deprecated exitBeforeEnter prop
    if (exitBeforeEnter) {
        mode = "wait"
        warnOnce(false, "Replace exitBeforeEnter with mode='wait'")
    }

    // We want to force a re-render once all exiting animations have finished. We
    // either use a local forceRender function, or one from a parent context if it exists.
    let [forceRender] = useForceUpdate()
    const forceRenderLayoutGroup = useContext(LayoutGroupContext).forceRender
    if (forceRenderLayoutGroup) forceRender = forceRenderLayoutGroup

    const isMounted = useIsMounted()

    // Filter out any children that aren't ReactElements. We can only track ReactElements with a props.key
    const filteredChildren = onlyElements(children)
    let childrenToRender = filteredChildren

    const exitingChildren = useRef(
        new Map<ComponentKey, ReactElement<any>>()
    ).current

    // Keep a living record of the children we're actually rendering so we
    // can diff to figure out which are entering and exiting
    const presentChildren = useRef(childrenToRender)

    // A lookup table to quickly reference components by key
    const allChildren = useRef(
        new Map<ComponentKey, ReactElement<any>>()
    ).current

    // If this is the initial component render, just deal with logic surrounding whether
    // we play onMount animations or not.
    const isInitialRender = useRef(true)

    useIsomorphicLayoutEffect(() => {
        isInitialRender.current = false

        updateChildLookup(filteredChildren, allChildren)
        presentChildren.current = childrenToRender
    })

    useUnmountEffect(() => {
        isInitialRender.current = true
        allChildren.clear()
        exitingChildren.clear()
    })

    if (isInitialRender.current) {
        return (
            <>
                {childrenToRender.map((child) => (
                    <PresenceChild
                        key={getChildKey(child)}
                        isPresent
                        initial={initial ? undefined : false}
                        presenceAffectsLayout={presenceAffectsLayout}
                        mode={mode}
                    >
                        {child}
                    </PresenceChild>
                ))}
            </>
        )
    }

    // If this is a subsequent render, deal with entering and exiting children

    // Diff the keys of the currently-present and target children to update our
    // preserving list.
    const presentKeys = presentChildren.current.map(getChildKey)
    const targetKeys = filteredChildren.map(getChildKey)
    const preservingKeys: ComponentKey[] = []

    // Diff the present children with our target children and mark those that are preserving
    const numPresent = presentKeys.length
    for (let i = 0; i < numPresent; i++) {
        const key = presentKeys[i]

        if (targetKeys.indexOf(key) !== -1) {
            preservingKeys.push(key)
        }
    }

    // split the presentChildren based on the key of the component you are preserving
    const presentChunks = splitChildrenByKeys(
        preservingKeys,
        presentChildren.current,
        (_child) => {
            const key = getChildKey(_child)
            const child = allChildren.get(key)!

            // If the component was exiting, reuse the previous component to preserve state
            let extingChild = exitingChildren.get(key)
            if (extingChild) return extingChild

            const onExit = () => {
                allChildren.delete(key)
                exitingChildren.delete(key)

                // Remove this child from the present children
                const removeIndex = presentChildren.current.findIndex(
                    (presentChild) => presentChild.key === key
                )
                presentChildren.current.splice(removeIndex, 1)

                // Defer re-rendering until all exiting children have indeed left
                if (!exitingChildren.size) {
                    presentChildren.current = filteredChildren

                    if (isMounted.current === false) return

                    forceRender()
                    onExitComplete && onExitComplete()
                }
            }
            extingChild = (
                <PresenceChild
                    key={key}
                    isPresent={false}
                    onExitComplete={onExit}
                    custom={custom}
                    presenceAffectsLayout={presenceAffectsLayout}
                    mode={mode}
                >
                    {child}
                </PresenceChild>
            )
            exitingChildren.set(key, extingChild)
            return extingChild
        }
    )

    const targetChunks = splitChildrenByKeys(
        preservingKeys,
        filteredChildren,
        (child) => (
            // Add `MotionContext` even to children that don't need it to ensure we're rendering
            // the same tree between renders
            <PresenceChild
                key={getChildKey(child)}
                isPresent
                presenceAffectsLayout={presenceAffectsLayout}
                mode={mode}
            >
                {child}
            </PresenceChild>
        )
    )

    // Combine the chunk separated by the preservingKeys.
    //
    // If a change occurs in the rendering array,
    // insert the chunk where the change occurred in the previous location.
    //
    // presentChildren  ->  children
    //     [1]                 [A]
    //     [A]                 [D]
    //     [2]                 [E]
    //     [B]                 [F]
    //     [3]                 [B]
    //     [C]                 [C]
    //
    // init -> animate -> Exit Complete
    //
    // [1]        [1]                <--- presentChunk - 1
    // [A]        [A]         [A]    <--- preservingKey
    // [2]        [2]                <--- presentChunk - 2
    //            [D]         [D]
    //            [E]         [E]    <--- targetChunk - 1
    //            [F]         [F]
    // [B]        [B]         [B]    <--- preservingKey
    // [3]        [3]                <--- presentChunk - 3
    //                        [B]    <--- targetChunk - 2
    // [C]        [C]         [C]    <--- preservingKey
    childrenToRender = []
    Array.from({ length: preservingKeys.length + 1 }).forEach((_, i) => {
        const key = preservingKeys[i]
        const child = allChildren.get(key)

        childrenToRender = childrenToRender.concat(presentChunks[i])

        // If we currently have exiting children, and we're deferring rendering incoming children
        // until after all current children have exiting, empty the childrenToRender array
        if (!(mode === "wait" && exitingChildren.size)) {
            childrenToRender = childrenToRender.concat(targetChunks[i])
        }

        if (child) {
            childrenToRender.push(
                <PresenceChild
                    key={key}
                    isPresent
                    presenceAffectsLayout={presenceAffectsLayout}
                    mode={mode}
                >
                    {child}
                </PresenceChild>
            )
        }
    })

    if (
        env !== "production" &&
        mode === "wait" &&
        childrenToRender.length > 1
    ) {
        console.warn(
            `You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`
        )
    }

    return (
        <>
            {exitingChildren.size
                ? childrenToRender
                : childrenToRender.map((child) => cloneElement(child))}
        </>
    )
}
