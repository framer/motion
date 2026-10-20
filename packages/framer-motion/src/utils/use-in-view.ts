"use client"

import { RefObject, useEffect, useState } from "react"
import { inView, InViewOptions } from "../render/dom/viewport"

export interface UseInViewOptions
    extends Omit<InViewOptions, "root" | "amount"> {
    root?: RefObject<Element | null>
    once?: boolean
    amount?: "some" | "all" | number
    initial?: boolean
}

export function useInView(
    ref: RefObject<Element | null>,
    {
        root,
        margin,
        amount,
        once = false,
        initial = false,
    }: UseInViewOptions = {}
) {
    const [isInView, setInView] = useState(initial)
    /**
     * Holds the element the observer was last set up with. Replacing the
     * object (rather than using a ref) re-runs the observer effect.
     */
    const [observed, observe] = useState<{ current?: Element | null }>({})

    useEffect(() => {
        const element = (observed.current = ref.current)
        if (!element || (once && isInView)) return

        const onEnter = () => {
            setInView(true)

            return once ? undefined : () => setInView(false)
        }

        const options: InViewOptions = {
            root: (root && root.current) || undefined,
            margin,
            amount,
        }

        return inView(element, onEnter, options)
    }, [root, ref, margin, once, amount, observed])

    /**
     * The ref object never changes, so if the element is attached, swapped
     * or removed after mount (e.g. conditional rendering) the effect above
     * won't re-run by itself. Check after every commit and re-observe,
     * resetting to false as the new element (if any) hasn't been seen yet.
     */
    useEffect(() => {
        if (ref.current !== observed.current) {
            once || setInView(false)
            observe({})
        }
    })

    return isInView
}
