import { createContext } from "react"
import { VariantLabels } from "../motion/types"

/**
 * @public
 */
export interface PresenceContextProps {
    id: string
    isPresent: boolean
    register: (id: string | number) => () => void
    onExitComplete?: (id: string | number) => void
    initial?: false | VariantLabels
    custom?: any
}

/**
 * @public
 */
export const PresenceContext = createContext<PresenceContextProps | null>(null)
