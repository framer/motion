import * as React from "react"
import { useContext } from "react"
import { Canvas, Props } from "@react-three/fiber"
import { MotionContext } from "../../context/MotionContext"

export interface MotionCanvasProps {}

export function MotionCanvas({
    children,
    ...props
}: Props & MotionCanvasProps) {
    const motionContext = useContext(MotionContext)
    return (
        <Canvas {...props}>
            <MotionContext.Provider value={motionContext}>
                {children}
            </MotionContext.Provider>
        </Canvas>
    )
}
