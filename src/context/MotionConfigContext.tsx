import { createContext } from "react"
import { Transition } from "../types"
import { TransformPoint2D } from "../types/geometry"

/**
 * @public
 */
export interface MotionConfigContext {
    /**
     * @internal
     */
    transformPagePoint: TransformPoint2D

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

    /**
     * Defines the document context to use for the entire tree.
     *
     * @public
     */
    documentContext: typeof document

    /**
     * Defines the window context to use for the entire tree.
     *
     * @public
     */
    windowContext: typeof window
}

/**
 * @public
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: (p) => p,
    isStatic: false,
    documentContext: document,
    windowContext: window,
})
