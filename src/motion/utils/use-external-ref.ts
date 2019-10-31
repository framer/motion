import { useEffect, useRef, Ref, RefObject } from "react"

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export function useExternalRef<E = Element>(
    externalRef?: Ref<E>
): RefObject<E> {
    // We're conditionally calling `useRef` here which is sort of naughty as hooks
    // shouldn't be called conditionally. However, Framer Motion will break if this
    // condition changes anyway. It might be possible to use an invariant here to
    // make it explicit, but I expect changing `ref` is not normal behaviour.
    const ref =
        !externalRef || typeof externalRef === "function"
            ? useRef(null)
            : externalRef

    // Handle `ref` functions. Again, calling the hook conditionally is kind of naughty
    // but `ref` types changing between renders would break Motion anyway. If we receive
    // bug reports about this, we should track the provided ref and throw an invariant
    // rather than move the conditional to inside the useEffect as this will be fired
    // for every Frame component within Framer.
    if (externalRef && typeof externalRef === "function") {
        useEffect(() => {
            externalRef(ref.current)
            return () => externalRef(null)
        }, [])
    }

    return ref
}
