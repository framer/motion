import * as React from "react"
import { MutableRefObject, useContext, useMemo, useRef } from "react"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../context/LayoutGroupContext"
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
    const [forceRender, key] = useForceUpdate()
    const context = useRef(
        null
    ) as MutableRefObject<LayoutGroupContextProps | null>

    if (context.current === null) {
        if (
            inheritId &&
            layoutGroupContext.id &&
            layoutGroupContext.id !== id
        ) {
            id = layoutGroupContext.id + "-" + id
        }

        context.current = {
            id,
            group: inheritId ? layoutGroupContext.group : nodeGroup(),
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
