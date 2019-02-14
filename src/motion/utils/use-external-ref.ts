import { useEffect, useRef, Ref, MutableRefObject, RefObject } from "react"

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export const useExternalRef = (
    external?: Ref<Element | null>
): RefObject<Element | null> => {
    const ref =
        !external || typeof external === "function" ? useRef(null) : external

    useEffect(() => {
        if (external && typeof external === "function") {
            external((ref as MutableRefObject<Element | null>).current)

            return () => external(null)
        }
    })

    return ref
}
