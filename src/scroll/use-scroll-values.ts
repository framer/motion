import { MotionValueMap } from "../motion/types"
import { SyntheticEvent } from "react"

const useScrollValues = (values: MotionValueMap, externalOnScroll: (e: SyntheticEvent) => void) => {
    const scrollX = values.get("scrollX")
    const scrollY = values.get("scrollY")

    if (!scrollX && !scrollY) return

    const onScroll = (e: SyntheticEvent) => {
        const { scrollLeft, scrollTop } = e.currentTarget as HTMLElement
        if (scrollX) scrollX.set(scrollLeft, false)
        if (scrollY) scrollY.set(scrollTop, false)

        if (externalOnScroll) externalOnScroll(e)
    }

    return onScroll
}

export { useScrollValues }
