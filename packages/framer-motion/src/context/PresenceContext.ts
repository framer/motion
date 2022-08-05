import { createContext } from "react"
import { VariantLabels } from "../motion/types"

/**
 * @public
 */
export interface PresenceContextProps {
    id: string
    isPresent: boolean
    register: (id: string) => () => void
    onExitComplete?: (id: string) => void
    initial?: false | VariantLabels
    custom?: any
}

/**
 * @public
 */
export const PresenceContext = createContext<PresenceContextProps | null>(null)
