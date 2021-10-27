import React from "react"
import { NodeGroup } from "../projection/node/group"

export interface LayoutGroupContextProps {
    id?: string
    group?: NodeGroup
    forceRender?: VoidFunction
}

/**
 * @internal
 */
export const LayoutGroupContext = React.createContext<LayoutGroupContextProps>(
    {}
)
