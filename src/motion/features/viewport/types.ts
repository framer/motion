import { RefObject } from "react"
import { TargetAndTransition } from "../../../types"
import { VariantLabels } from "../../types"

export type ViewportEventHandler = () => void

export interface ViewportOptions {
    root?: RefObject<Element>
    once?: boolean
    margin?: string
    amount?: "some" | "all"
}

export interface ViewportProps {
    whileInView?: VariantLabels | TargetAndTransition
    onViewportEnter?: ViewportEventHandler
    onViewportLeave?: ViewportEventHandler
    viewport?: ViewportOptions
}
