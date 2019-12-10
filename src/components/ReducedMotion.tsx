import * as React from "react"
import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"

interface Props {
    children?: any
    detect?: boolean
    force?: boolean
}

export function ReducedMotion({
    children,
    force = false,
    detect = true,
}: Props) {
    let context = useContext(MotionContext)

    context = {
        ...context,
        reducedMotion: { force, detect },
    }

    return (
        <MotionContext.Provider value={context}>
            {children}
        </MotionContext.Provider>
    )
}
