import { Animator } from "./"
import { useMemo, useEffect } from "react"

export const useAnimator = poses => {
    const animator = useMemo(() => new Animator(), [])
    animator.setPoses(poses)

    useEffect(() => {
        animator.mount()
        return () => animator.unmount()
    }, [])

    return animator
}
