import * as React from "react"
import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"

interface Props {
    children?: any
    detect?: boolean
    force?: boolean
}

/**
 * Define accessibility options for a tree. Can be used to force the tree into Reduced Motion mode,
 * or disable device detection.
 *
 * @internal
 */
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
