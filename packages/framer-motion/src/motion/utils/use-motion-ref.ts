"use client"

import type { VisualElement } from "motion-dom"
import * as React from "react"
import { useCallback, useInsertionEffect, useRef } from "react"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualState } from "./use-visual-state"

/**
 * Creates a ref function that, when called, hydrates the provided
 * external ref and VisualElement.
 */
export function useMotionRef<Instance, RenderState>(
    visualState: VisualState<Instance, RenderState>,
    visualElement?: VisualElement<Instance> | null,
    externalRef?: React.Ref<Instance>
): React.Ref<Instance> {
    /**
     * Store externalRef in a ref to avoid including it in the useCallback
     * dependency array. Including externalRef in dependencies causes issues
     * with libraries like Radix UI that create new callback refs on each render
     * when using asChild - this would cause the callback to be recreated,
     * triggering element remounts and breaking AnimatePresence exit animations.
     */
    const externalRefContainer = useRef(externalRef)
    useInsertionEffect(() => {
        externalRefContainer.current = externalRef
    })

    const instanceRef = useRef<Instance | null>(null)

    // The external ref currently holding the instance, and how to detach it
    const attachedRef = useRef<React.Ref<Instance>>()
    const detachRef = useRef<() => void>()

    /**
     * Hand the mounted instance to the latest externalRef, detaching
     * it from the previous one.
     */
    const syncExternalRef = () => {
        const instance = instanceRef.current
        const ref = instance && externalRefContainer.current

        if (ref !== attachedRef.current) {
            detachRef.current?.()
            attachedRef.current = ref

            const setRef =
                typeof ref === "function"
                    ? ref
                    : (value: Instance | null) => {
                          if (ref) {
                              ;(ref as React.MutableRefObject<Instance | null>)
                                  .current = value
                          }
                      }

            // Callback refs can return a cleanup function (React 19)
            const cleanup = setRef(instance)
            detachRef.current =
                typeof cleanup === "function" ? cleanup : () => setRef(null)
        }
    }

    /**
     * As the ref callback is stable, React won't hand a changed externalRef
     * the instance, so it's synced here instead, without remounting the
     * VisualElement. Instance changes are synced by the ref callback, so this
     * only needs to run when externalRef changes.
     */
    useIsomorphicLayoutEffect(syncExternalRef, [externalRef])

    return useCallback(
        (instance: Instance) => {
            if (instance) {
                visualState.onMount?.(instance)
            }

            if (visualElement) {
                instance ? visualElement.mount(instance) : visualElement.unmount()
            }

            instanceRef.current = instance
            syncExternalRef()
        },
        [visualElement]
    )
}
