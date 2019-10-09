import { useEffect, useRef, Ref, RefObject, MutableRefObject } from "react"
import { isRefObject } from "../../utils/is-ref-object"

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export function useExternalRef<E = Element>(external?: Ref<E>): RefObject<E> {
    const ref = useRef<E>(null)

    useEffect(() => {
        // If there's no external ref, we don't need to handle it in a special way
        if (!external) return

        if (typeof external === "function") {
            external(ref.current)

            return () => external(null)
        } else if (isRefObject(external)) {
            const mutableExternal = external as MutableRefObject<E | null>

            // If we've been provided a RefObject, we need to assign its current with our
            // current on mount
            mutableExternal.current = ref.current

            return () => {
                // We only set our external ref value to null on unmount if it still contains the
                // same element as our internal ref. This is because the component might be a child
                // of `AnimatePresence` where we might be in a situation where a user is providing
                // the same ref to multiple components.
                if (external.current === ref.current) {
                    mutableExternal.current = null
                }
            }
        }
    }, [])

    return ref
}
