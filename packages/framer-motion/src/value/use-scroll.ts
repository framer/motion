import { scroll, ScrollOptions } from "@motionone/dom"
import { RefObject } from "react"
import { motionValue } from "."
import { useConstant } from "../utils/use-constant"
import { useEffect } from "react"
import { useIsomorphicLayoutEffect } from "../three-entry"

interface UseScrollOptions extends Omit<ScrollOptions, "container" | "target"> {
    container?: RefObject<HTMLElement>
    target?: RefObject<HTMLElement>
    layoutEffect?: boolean
}

const createScrollMotionValues = () => ({
    scrollX: motionValue(0),
    scrollY: motionValue(0),
    scrollXProgress: motionValue(0),
    scrollYProgress: motionValue(0),
})

export function useScroll({
    container,
    target,
    layoutEffect = true,
    ...options
}: UseScrollOptions = {}) {
    const values = useConstant(createScrollMotionValues)

    const useLifecycleEffect = layoutEffect
        ? useIsomorphicLayoutEffect
        : useEffect

    useLifecycleEffect(() => {
        return scroll(
            ({ x, y }) => {
                values.scrollX.set(x.current)
                values.scrollXProgress.set(x.progress)
                values.scrollY.set(y.current)
                values.scrollYProgress.set(y.progress)
            },
            {
                ...options,
                container: container?.current || undefined,
                target: target?.current || undefined,
            }
        )
    }, [])

    return values
}
