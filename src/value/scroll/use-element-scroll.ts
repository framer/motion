import { RefObject, useLayoutEffect } from "react"
import { useConstant } from "../../utils/use-constant"
import {
    createScrollMotionValues,
    ScrollMotionValues,
    createScrollUpdater,
} from "./utils"
import { useDomEvent, addDomEvent } from "../../events/use-dom-event"
import { invariant } from "hey-listen"

const getElementScrollOffsets = (element: HTMLElement) => () => {
    return {
        xOffset: element.scrollLeft,
        yOffset: element.scrollTop,
        xMaxOffset: element.scrollWidth - element.offsetWidth,
        yMaxOffset: element.scrollHeight - element.offsetHeight,
    }
}

export function useElementScroll(
    ref: RefObject<HTMLElement>
): ScrollMotionValues {
    const values = useConstant(createScrollMotionValues)

    useLayoutEffect(() => {
        const element = ref.current

        invariant(!!element, "")
        if (!element) return

        const updateScrollValues = createScrollUpdater(
            values,
            getElementScrollOffsets(element)
        )

        const scrollListener = addDomEvent(
            window,
            "scroll",
            updateScrollValues,
            { passive: true }
        )
        const resizeListener = addDomEvent(window, "resize", updateScrollValues)

        return () => {
            scrollListener && scrollListener()
            resizeListener && resizeListener()
        }
    }, [])

    return values
}
