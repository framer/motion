import { useEffect, useRef, Ref, MutableRefObject, RefObject } from "react"

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export function useExternalRef<E = Element>(
    external?: Ref<E | null>
): RefObject<E | null> {
    const ref =
        !external || typeof external === "function" ? useRef(null) : external

    useEffect(() => {
        if (external && typeof external === "function") {
            external((ref as MutableRefObject<E | null>).current)

            return () => external(null)
        }
    })

    return ref
}
