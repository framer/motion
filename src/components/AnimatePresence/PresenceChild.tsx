import * as React from "react"
import { useEffect, useMemo, useRef } from "react"
import { PresenceContextProps, PresenceContext } from "./PresenceContext"

type PresenceChildProps = PresenceContextProps & {
    children: React.ReactElement<any>
}

export const PresenceChild = ({
    children,
    initial,
    isExiting,
    onExitComplete,
    custom,
}: PresenceChildProps) => {
    const totalExitingChildren = useRef(0)

    useEffect(() => {
        totalExitingChildren.current = 0
    }, [isExiting])

    const context = useMemo(() => {
        let numExitComplete = 0

        const allExitComplete = () => {
            numExitComplete++

            if (numExitComplete >= totalExitingChildren.current) {
                onExitComplete()
            }
        }

        return {
            initial,
            isExiting,
            onExitComplete: allExitComplete,
            custom,
            register: () => totalExitingChildren.current++,
        }
    }, [isExiting, initial, custom])

    return (
        <PresenceContext.Provider value={context}>
            {children}
        </PresenceContext.Provider>
    )
}
