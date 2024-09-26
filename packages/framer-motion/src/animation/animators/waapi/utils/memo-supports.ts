import { memo } from "../../../../utils/memo"
import { supportsFlags } from "./supports-flags"

export function memoSupports<T extends any>(
    callback: () => T,
    supportsFlag: keyof typeof supportsFlags
) {
    const memoized = memo(callback)
    return () => supportsFlags[supportsFlag] ?? memoized()
}
