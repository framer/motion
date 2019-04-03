import { useRef } from "react"

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

    if (count.current++ < times) callback()
}
