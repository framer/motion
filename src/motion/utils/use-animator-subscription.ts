import { useEffect } from "react"

export const useAnimatorSubscription = (animator, playback) => {
    useEffect(
        () => {
            if (animator) {
                const unsubscribe = animator.subscribe(playback)
                return () => unsubscribe()
            }
        },
        [animator]
    )
}
