import { createContext } from "react"

export interface PromoteGroupContextProps {
    isPromoted?: boolean
}

/**
 * @internal
 */
export const PromoteGroupContext = createContext<PromoteGroupContextProps>({})
