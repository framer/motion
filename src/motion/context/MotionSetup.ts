import { createContext } from "react"
import { renderDOM } from "../../render/dom/Component"
import { MotionProps } from "../types"
import { MotionValuesMap } from "../utils/use-motion-values"

interface MotionSetupContextSettings {
    render: (
        Component: string,
        props: MotionProps,
        values: MotionValuesMap,
        isStatic: boolean
    ) => any
}

export const MotionSetupContext = createContext<MotionSetupContextSettings>({
    render: renderDOM,
})
