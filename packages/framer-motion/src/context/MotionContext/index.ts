import { createContext } from "react"
import type { VisualElement } from "../../render/VisualElement"

export interface MotionContextProps<Instance = unknown> {
    visualElement?: VisualElement<Instance>
    initial?: false | string | string[]
    animate?: string | string[]
}

export const MotionContext = createContext<MotionContextProps>({})
