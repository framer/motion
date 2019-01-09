import { useEffect, useRef, Ref, MutableRefObject, RefObject } from "react"

export const useExternalRef = (external?: Ref<Element | null>): RefObject<Element | null> => {
    const ref = !external || typeof external === "function" ? useRef(null) : external

    useEffect(() => {
        if (external && typeof external === "function") {
            external((ref as MutableRefObject<Element | null>).current)

            return () => external(null)
        }
    })

    return ref
}
