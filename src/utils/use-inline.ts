import { useRef } from "react"

type Callback = () => void

export function shallowCompare(next: any[], prev: any[] | null) {
    if (prev === null) return false

    const prevLength = prev.length

    if (prevLength !== next.length) return false

    for (let i = 0; i < prevLength; i++) {
        if (prev[i] !== next[i]) return false
    }

    return true
}

/**
 * Runs a function inline if hook dependencies have changed.
 *
 * This is similar to using `useMemo` without memoization. The `useMemo` docs state:
 *
 * >  You may rely on useMemo as a performance optimization, not as a semantic guarantee.
 *    In the future, React may choose to “forget” some previously memoized values and recalculate
 *    them on next render, e.g. to free memory for offscreen components.
 *
 * This hook guarantees the callback is only re-executed if dependencies change.
 *
 * @param callback
 * @param times
 */
export function useInline(callback: Callback, deps: any[]) {
    const prevDeps = useRef<any[] | null>(null)
    let callbackReturnValue

    if (!shallowCompare(deps, prevDeps.current)) {
        callbackReturnValue = callback()
    }

    prevDeps.current = deps

    return callbackReturnValue
}
