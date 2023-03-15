import { RefObject, useRef } from "react"
import { useConstant } from "../../utils/use-constant"
import { createScopedAnimate } from "../animate"

export function useAnimate() {
    const scope = useRef<Element>(null)
    const animate = useConstant(() => createScopedAnimate(() => scope.current!))

    return [scope, animate] as [RefObject<Element>, typeof animate]
}
