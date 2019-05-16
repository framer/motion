import { useEffect, RefObject } from "react"
import { safeWindow } from "../events/utils/window"
import { isRefObject } from "./is-ref-object"

type ResizeListener = () => void

/**
 * A hook to use the window resize listener. In future it might be cool to use `ResizeObserver`
 * but it currently needs to be polyfilled and the size trade-off isn't there for this use-case.
 *
 * TODO: Debounce this bad boy
 *
 * @param onResize
 */
export function useResize(
    element: any | RefObject<Element>,
    onResize: ResizeListener
) {
    useEffect(
        () => {
            if (!element || !isRefObject(element)) return
            safeWindow.addEventListener("resize", onResize)
            return () => safeWindow.removeEventListener("resize", onResize)
        },
        [element, onResize]
    )
}
