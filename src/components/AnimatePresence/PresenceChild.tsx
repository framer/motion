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
}: PresenceChildProps) => {
    const presenceChildren = useConstant(newChildrenMap)
    const id = useConstant(getPresenceId)

    const context = useMemo(() => {
        presenceChildren.forEach((_, key) => presenceChildren.set(key, false))

        return {
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
        }
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
