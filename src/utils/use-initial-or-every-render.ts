import { useRef } from "react"

type Callback = () => void

/**
 * Use callback either only on the initial render or on all renders. In concurrent mode
 * the "initial" render might run multiple times.
 *
 * @param callback - Callback to run
 * @param isInitialOnly - Maximum number of times to run the callback. Defaults to `1`
 *
 * @public
 */
export function useInitialOrEveryRender(
    callback: Callback,
    isInitialOnly = false
) {
    const isInitialRender = useRef(true)

    if (!isInitialOnly || (isInitialOnly && isInitialRender.current)) {
        callback()
    }

    isInitialRender.current = false
}
