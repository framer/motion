import * as React from "react"
import { createContext, useContext, useRef } from "react"
import { Point } from "../../events/types"
import { AutoValueHandlers } from "../features/auto/values"
import { MotionFeature } from "../features/types"

export interface MotionPluginsContext {
    transformPagePoint: (point: Point) => Point
    autoValues: AutoValueHandlers
    features: MotionFeature[]
}

export interface MotionPluginProps extends Partial<MotionPluginsContext> {
    children?: React.ReactNode
}

/**
 * @internal
 */
export const MotionPluginContext = createContext<MotionPluginsContext>({
    transformPagePoint: p => p,
    autoValues: {},
    features: [],
})

/**
 * @remarks For now I think this should remain a private API for our own use
 * until we can figure out a nicer way of allowing people to add these
 *
 * @internal
 */
export function MotionPlugins({ children, ...props }: MotionPluginProps) {
    const pluginContext = useContext(MotionPluginContext)
    const value = useRef({ ...pluginContext }).current

    // Mutative to prevent triggering rerenders in all listening
    // components every time this component renders
    for (const key in props) {
        value[key] = props[key]
    }

    return (
        <MotionPluginContext.Provider value={value}>
            {children}
        </MotionPluginContext.Provider>
    )
}
