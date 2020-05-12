import * as React from "react"
import { useMemo, useRef } from "react"
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
    const id = useConstant(getPresenceId)
    const numPresenceChildren = useRef(0)
    const numExitComplete = useRef(0)

    const context = {
        initial,
        isPresent,
        custom,
        onExitComplete: () => {
            numExitComplete.current++

            const allComplete =
                numExitComplete.current >= numPresenceChildren.current

            onExitComplete && allComplete && onExitComplete()
        },
    }

    const register = useMemo(() => {
        numExitComplete.current = 0

        return () => {
            numPresenceChildren.current++
            return () => numPresenceChildren.current--
        }
    }, [isPresent])

    return (
        <PresenceContext.Provider value={{ id, ...context, register }}>
            {children}
        </PresenceContext.Provider>
    )
}
