"use client"

import { RefObject, useEffect, useRef, useState } from "react"
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
    const [checks, recheck] = useState(0)
    const observed = useRef<Element | null>(null)

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
    }, [root, ref, margin, once, amount, checks])

    /**
     * The ref object never changes, so if the element is attached, swapped
     * or removed after mount (e.g. conditional rendering) the effect above
     * won't re-run by itself. Check after every commit.
     */
    useEffect(() => {
        ref.current !== observed.current && recheck(checks + 1)
    })

    return isInView
}
