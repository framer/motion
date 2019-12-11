import * as React from "react"
import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"

interface Props {
    children?: any
    enabled?: boolean | undefined
}

/**
 * Define accessibility options for a tree. Can be used to force the tree into Reduced Motion mode,
 * or disable device detection.
 *
 * @internal
 */
export function ReducedMotion({ children, enabled }: Props) {
    let context = useContext(MotionContext)

    context = {
        ...context,
        isReducedMotion: enabled,
    }

    return (
        <MotionContext.Provider value={context}>
            {children}
        </MotionContext.Provider>
    )
}
