import { useMemo, CSSProperties } from "react"
import { buildStyleProperty } from "stylefire"
import { MotionValue } from "../motion-value"
import { resolveCurrent } from "../utils/resolve-values"

export const useStyleAttr = (values: Map<string, MotionValue>, styles?: CSSProperties): CSSProperties =>
    useMemo(
        () => ({
            ...styles,
            ...buildStyleProperty(resolveCurrent(values)),
        }),
        []
    )
