import * as React from "react"
import { createContext, useContext, useRef, ReactNode } from "react"
import { Point } from "../../events"

export interface MotionPlugins {
    transformPointer: (point: Point) => Point
}

export interface MotionPluginProps extends MotionPlugins {
    children?: ReactNode
}

export const MotionPluginContext = createContext<Partial<MotionPlugins>>({})

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
