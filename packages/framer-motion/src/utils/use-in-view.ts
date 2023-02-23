import { RefObject, useEffect, useState } from "react"
import { inView, InViewOptions } from "../render/dom/viewport"

interface Options extends Omit<InViewOptions, "root" | "amount"> {
    root?: RefObject<Element>
    once?: boolean
    amount?: "some" | "all" | number
}

export function useInView(
    ref: RefObject<Element>,
    { root, margin, amount, once = false }: Options = {}
) {
    const [isInView, setInView] = useState(false)

    useEffect(() => {
        if (!ref.current || (once && isInView)) return

        const onEnter = () => {
            setInView(true)

            return once ? undefined : () => setInView(false)
        }

        const options: InViewOptions = {
            root: (root && root.current) || undefined,
            margin,
            amount: amount === "some" ? "any" : amount,
        }

        return inView(ref.current, onEnter, options)
    }, [root, ref, margin, once])

    return isInView
}
