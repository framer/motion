import * as React from "react"
import { useMemo } from "react"
import { PresenceContext } from "./PresenceContext"
import { VariantLabels } from "../../motion/types"
import { useConstant } from "../../utils/use-constant"

interface PresenceChildProps {
    children: React.ReactElement<any>
    isPresent: boolean
    onExitComplete?: () => void
    initial?: false | VariantLabels
    custom?: any
    presenceAffectsLayout: boolean
}

let presenceId = 0
function getPresenceId() {
    const id = presenceId
    presenceId++
    return id
}

export const PresenceChild = ({
    children,
    initial,
    isPresent,
    onExitComplete,
    custom,
    presenceAffectsLayout,
}: PresenceChildProps) => {
    const presenceChildren = useConstant(newChildrenMap)
    const id = useConstant(getPresenceId)

    const context = useMemo(
        () => ({
            id,
            initial,
            isPresent,
            custom,
            onExitComplete: (childId: number) => {
                presenceChildren.set(childId, true)
                let allComplete = true
                presenceChildren.forEach((isComplete) => {
                    if (!isComplete) allComplete = false
                })

                allComplete && onExitComplete?.()
            },
            register: (childId: number) => {
                presenceChildren.set(childId, false)
                return () => presenceChildren.delete(childId)
            },
        }),
        /**
         * If the presence of a child affects the layout of the components around it,
         * we want to make a new context value to ensure they get re-rendered
         * so they can detect that layout change.
         */
        presenceAffectsLayout ? undefined : [isPresent]
    )

    useMemo(() => {
        presenceChildren.forEach((_, key) => presenceChildren.set(key, false))
    }, [isPresent])

    /**
     * If there's no `motion` components to fire exit animations, we want to remove this
     * component immediately.
     */
    React.useEffect(() => {
        !isPresent && !presenceChildren.size && onExitComplete?.()
    }, [isPresent])

    return (
        <PresenceContext.Provider value={context}>
            {children}
        </PresenceContext.Provider>
    )
}

function newChildrenMap(): Map<number, boolean> {
    return new Map()
}
