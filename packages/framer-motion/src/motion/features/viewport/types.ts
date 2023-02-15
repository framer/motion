import { RefObject } from "react"
import { TargetAndTransition } from "../../../types"
import { VariantLabels } from "../../types"

export type ViewportEventHandler = (
    entry: IntersectionObserverEntry | null
) => void

export interface ViewportOptions {
    root?: RefObject<Element>
    once?: boolean
    margin?: string
    amount?: "some" | "all" | number
    /**
     * @deprecated IntersectionObserver fallback will always be disabled from 10.0. Prefer polyfill for older browser support.
     */
    fallback?: boolean
}

export interface ViewportProps {
    whileInView?: VariantLabels | TargetAndTransition
    onViewportEnter?: ViewportEventHandler
    onViewportLeave?: ViewportEventHandler
    viewport?: ViewportOptions
}

export type ViewportState = {
    hasEnteredView: boolean
    isInView: boolean
}
