import * as React from "react"
import { MutableRefObject, useMemo, useRef } from "react"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../context/LayoutGroupContext"
import { nodeGroup } from "../../projection"
import { useForceUpdate } from "../../utils/use-force-update"

export interface Props {
    prefix?: string
    children?: React.ReactChild // TODO Fix children type here to accept multiple children
}

export function LayoutGroup({ children, prefix }: Props) {
    const [forceRender, key] = useForceUpdate()
    const context = useRef(
        null
    ) as MutableRefObject<LayoutGroupContextProps | null>

    if (context.current === null) {
        context.current = {
            prefix,
            group: nodeGroup(),
        }
    }

    // TODO If parent id, incorporate
    return (
        <LayoutGroupContext.Provider
            value={useMemo(() => ({ ...context.current, forceRender }), [key])}
        >
            {children}
        </LayoutGroupContext.Provider>
    )
}
