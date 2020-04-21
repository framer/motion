import { createContext } from "react"
import { VariantLabels } from "../../motion/types"

/**
 * @public
 */
export interface PresenceContextProps {
    isPresent: boolean
    register: () => () => void
    onExitComplete?: () => void
    initial?: false | VariantLabels
    custom?: any
}

/**
 * @public
 */
export const PresenceContext = createContext<PresenceContextProps | null>(null)
