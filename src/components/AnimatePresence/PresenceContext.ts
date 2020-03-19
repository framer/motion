import { createContext } from "react"
import { VariantLabels } from "../../motion/types"

export type ExitingProps = {
    isExiting: true
    initial?: false | VariantLabels
    onExitComplete: () => void
    custom?: any
}

export type PresentProps = {
    isExiting: false
    initial?: false | VariantLabels
    custom?: any
}

export type PresenceContextProps = PresentProps | ExitingProps

export const PresenceContext = createContext<PresenceContextProps | null>(null)
