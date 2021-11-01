import { createContext } from "react"
import { TransformPoint } from "../projection/geometry/types"
import { Transition } from "../types"

/**
 * @public
 */
export interface MotionConfigContext {
    /**
     * @internal
     */
    transformPagePoint: TransformPoint

    /**
     * Determines whether this is a static context ie the Framer canvas. If so,
     * it'll disable all dynamic functionality.
     *
     * @internal
     */
    isStatic: boolean

    /**
     * Defines a new default transition for the entire tree.
     *
     * @public
     */
    transition?: Transition
}

/**
 * @public
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: (p) => p,
    isStatic: false,
})
