import * as React from "react"
import { MutableRefObject, useContext, useMemo, useRef } from "react"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../context/LayoutGroupContext"
import { DeprecatedLayoutGroupContext } from "../../context/DeprecatedLayoutGroupContext"
import { nodeGroup } from "../../projection"
import { useForceUpdate } from "../../utils/use-force-update"

export interface Props {
    id?: string
    inheritId?: boolean
}

export const LayoutGroup: React.FunctionComponent<Props> = ({
    children,
    id,
    inheritId = true,
}) => {
    const layoutGroupContext = useContext(LayoutGroupContext)
    const deprecatedLayoutGroupContext = useContext(
        DeprecatedLayoutGroupContext
    )
    const [forceRender, key] = useForceUpdate()
    const context = useRef(
        null
    ) as MutableRefObject<LayoutGroupContextProps | null>

    const upstreamId = layoutGroupContext.id ?? deprecatedLayoutGroupContext
    if (context.current === null) {
        if (inheritId && upstreamId) {
            id = id ? upstreamId + "-" + id : upstreamId
        }

        context.current = {
            id,
            group: inheritId
                ? layoutGroupContext?.group ?? nodeGroup()
                : nodeGroup(),
        }
    }

    const memoizedContext = useMemo(
        () => ({ ...context.current, forceRender }),
        [key]
    )

    return (
        <LayoutGroupContext.Provider value={memoizedContext}>
            {children}
        </LayoutGroupContext.Provider>
    )
}
