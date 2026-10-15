import type { AnimationOptions } from "../animation/types"

/**
 * The scope that `animate()`, `scroll()`, `inView()`, gestures and
 * `resize()` register their cleanups with while it runs. Set by
 * `scopeMotion()`.
 */
export interface ActiveScope {
    root?: Element
    transition?: AnimationOptions
    add(cleanup: VoidFunction): VoidFunction
    bind<F extends (...args: any[]) => any>(callback: F): F
    track(element: Element): void
}

export const activeScope: { current?: ActiveScope } = {}

/**
 * Register `cleanup` with the active scope, if there is one, so stopping
 * the scope also runs it.
 */
export function addToScope<T extends VoidFunction>(cleanup: T): T {
    activeScope.current?.add(cleanup)
    return cleanup
}

/**
 * Bind `callback` to the active scope, so anything it starts later (for
 * instance an animation in an `inView()` callback) is collected too.
 */
export const bindToScope = <F extends (...args: any[]) => any>(callback: F) =>
    activeScope.current ? activeScope.current.bind(callback) : callback
