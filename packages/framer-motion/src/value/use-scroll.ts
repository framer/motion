import { RefObject } from "react"
import { motionValue } from "."
import { useConstant } from "../utils/use-constant"
import { useEffect } from "react"
import { useIsomorphicLayoutEffect } from "../three-entry"
import { warning } from "../utils/errors"
import { scroll } from "../render/dom/scroll"

interface UseScrollOptions extends Omit<ScrollOptions, "container" | "target"> {
    container?: RefObject<HTMLElement>
    target?: RefObject<HTMLElement>
    layoutEffect?: boolean
}

function refWarning(name: string, ref?: RefObject<HTMLElement>) {
    warning(
        Boolean(!ref || ref.current),
        `You have defined a ${name} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref, or setting its \`layoutEffect: false\` option.`
    )
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
        refWarning("target", target)
        refWarning("container", container)

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
