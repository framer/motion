import { AnimationManager } from "."
import { useMemo, useEffect } from "react"
import { Poses } from "../types"

export const useAnimation = (poses: Poses) => {
    const animation = useMemo(() => new AnimationManager(), [])
    animation.setPoses(poses)

    useEffect(() => {
        animation.mount()
        return () => animation.unmount()
    }, [])

    return animation
}
