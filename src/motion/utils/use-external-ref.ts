import { useEffect, useRef, Ref, MutableRefObject, RefObject } from "react"

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export function useExternalRef<E = Element>(
    external?: Ref<E | null>
): RefObject<E | null> {
    // We're conditionally calling `useRef` here which is sort of naughty as hooks
    // shouldn't be called conditionally. However, Framer Motion will break if this
    // condition changes anyway. It might be possible to use an invariant here to
    // make it explicit, but I expect changing `ref` is not normal behaviour.
    const ref =
        !external || typeof external === "function" ? useRef(null) : external

    useEffect(() => {
        if (external && typeof external === "function") {
            external((ref as MutableRefObject<E | null>).current)

            return () => external(null)
        }
    }, [])

    return ref
}
