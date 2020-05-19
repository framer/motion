import * as React from "react"
import { useContext, createContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"
import { MotionValue } from "../value"

export type TransformBoundaryValues = {
    x: MotionValue<number> | undefined
    y: MotionValue<number> | undefined
}

export const TransformBoundaryContext = createContext<TransformBoundaryValues>({
    x: new MotionValue(0),
    y: new MotionValue(0),
})

export function TransformBoundary({ children }: { children: React.ReactNode }) {
    const { values } = useContext(MotionContext)

    return (
        <TransformBoundaryContext.Provider
            value={{ x: values?.get("x"), y: values?.get("y") }}
        >
            {children}
        </TransformBoundaryContext.Provider>
    )
}
