import { useRef } from "react"
import { useInline } from "./use-inline"

type Callback = () => void

/**
 * Use a callback a maximum number of times
 * @param callback - Callback to run
 * @param times - Maximum number of times to run the callback. Defaults to `1`
 *
 * @public
 */
export function useMaxTimes(callback: Callback, times = 1) {
    const count = useRef(0)
    count.current = Math.min(count.current + 1, times)

    return useInline(callback, [count.current])
}
