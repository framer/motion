import { createContext } from "react"
import { VariantLabels } from "../../motion/types"

export interface PresenceContextProps {
    isPresent: boolean
    register: () => () => void
    onExitComplete?: () => void
    initial?: false | VariantLabels
    custom?: any
}

export const PresenceContext = createContext<PresenceContextProps | null>(null)
