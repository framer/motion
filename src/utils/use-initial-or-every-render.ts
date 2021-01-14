import { useEffect, useRef } from "react"

type Callback = () => void

export function useIsInitialRender() {
    const isInitialRender = useRef(true)
    useEffect(() => {
        isInitialRender.current = false
    }, [])
    return isInitialRender.current
}

/**
 * Use callback either only on the initial render or on all renders. In concurrent mode
 * the "initial" render might run multiple times
 *
 * @param callback - Callback to run
 * @param isInitialOnly - Set to `true` to only run on initial render, or `false` for all renders. Defaults to `false`.
 *
 * @public
 */
export function useInitialOrEveryRender(
    callback: Callback,
    isInitialOnly = false
) {
    const isInitialRender = useIsInitialRender()

    if (!isInitialOnly || (isInitialOnly && isInitialRender)) {
        callback()
    }
}
