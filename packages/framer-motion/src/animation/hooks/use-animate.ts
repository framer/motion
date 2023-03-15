import { useRef } from "react"
import { useConstant } from "../../utils/use-constant"
import { createScopedAnimate } from "../animate"

/**
 * We explicitly type this RefObject as not-null as this
 * allows the usage of animate(scope.current) without
 * type errors. In development we have runtime checking
 * to ensure .current is actually defined.
 */
export interface ScopeRefObject<T> {
    readonly current: T
}

export function useAnimate<T extends Element>() {
    const scope = useRef<T>(null)
    const animate = useConstant(() => createScopedAnimate(() => scope.current!))

    return [scope, animate] as [ScopeRefObject<T>, typeof animate]
}
