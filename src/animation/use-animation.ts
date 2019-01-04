import { AnimationManager } from "."
import { useMemo, useEffect } from "react"

export const useAnimation = () => {
    const animation = useMemo(() => new AnimationManager(), [])

    useEffect(() => {
        animation.mount()
        return () => animation.unmount()
    }, [])

    return animation
}
