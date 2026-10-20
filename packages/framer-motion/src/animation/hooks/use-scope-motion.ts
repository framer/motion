"use client"

import { scopeMotion } from "motion-dom"
import type { MotionScope, ScopeOptions, ScopeSetup } from "motion-dom"
import { DependencyList, RefObject, useRef } from "react"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"

export interface UseScopeMotionOptions extends ScopeOptions {
    /**
     * Cancel the scope and run setup again when any of these change.
     */
    deps?: DependencyList
}

/**
 * Run `setup` in a `scopeMotion()` scope rooted at `ref`, so selectors
 * resolve inside it. The scope is cancelled on unmount, or when `deps`
 * change, which stops everything started in it and restores inline styles.
 *
 * ```jsx
 * const ref = useRef(null)
 * useScopeMotion(ref, () => {
 *     inView("li", (el) => animate(el, { opacity: 1 }))
 * })
 * return <ul ref={ref}>...</ul>
 * ```
 *
 * Returns a ref to the current scope, for `run()` and `bind()` in event
 * handlers.
 *
 * @public
 */
export function useScopeMotion(
    ref: RefObject<Element | null> | null | undefined,
    setup: ScopeSetup,
    { deps = [], ...options }: UseScopeMotionOptions = {}
): RefObject<MotionScope | null> {
    const scope = useRef<MotionScope | null>(null)
    const latestSetup = useRef(setup)
    latestSetup.current = setup

    useIsomorphicLayoutEffect(() => {
        const current = (scope.current = scopeMotion(
            ref?.current || undefined,
            (s) => latestSetup.current(s),
            options
        ))

        return () => {
            current.cancel()
            if (scope.current === current) scope.current = null
        }
    }, deps)

    return scope
}
