import * as React from "react"
import { createContext, useContext, useRef, ReactNode } from "react"
import { Point } from "../../events"

export interface MotionPlugins {
    transformPagePoint: (point: Point) => Point
}

export interface MotionPluginProps extends MotionPlugins {
    children?: ReactNode
}

export const MotionPluginContext = createContext<Partial<MotionPlugins>>({})

// For now I think this should remain a private API for our own use until
// we can figure out a nicer way of allowing people to add these
export const MotionPlugins = ({ children, ...props }: MotionPluginProps) => {
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
