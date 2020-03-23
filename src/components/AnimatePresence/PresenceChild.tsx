import * as React from "react"
import { useMemo, useRef } from "react"
import { PresenceContext } from "./PresenceContext"
import { VariantLabels } from "../../motion/types"

interface PresenceChildProps {
    children: React.ReactElement<any>
    isPresent: boolean
    onExitComplete?: () => void
    initial?: false | VariantLabels
    custom?: any
}

export const PresenceChild = ({
    children,
    initial,
    isPresent,
    onExitComplete,
    custom,
}: PresenceChildProps) => {
    const numPresenceChildren = useRef(0)

    const context = {
        initial,
        isPresent,
        custom,
    }

    const lifecycle = useMemo(() => {
        let numExitComplete = 0

        return {
            onExitComplete: () => {
                numExitComplete++
                if (
                    onExitComplete &&
                    numExitComplete >= numPresenceChildren.current
                ) {
                    onExitComplete()
                }
            },
            register: () => {
                numPresenceChildren.current++
                return () => numPresenceChildren.current--
            },
        }
    }, [isPresent, onExitComplete])

    return (
        <PresenceContext.Provider value={{ ...context, ...lifecycle }}>
            {children}
        </PresenceContext.Provider>
    )
}
