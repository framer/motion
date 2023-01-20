import { appearStoreId } from "./store-id"
import { animateStyle } from "../waapi"
import { NativeAnimationOptions } from "../waapi/types"
import { optimizedAppearDataId } from "./data-id"
import { handoffOptimizedAppearAnimation } from "./handoff"
import { appearAnimationStore } from "./store"

export function startOptimizedAppearAnimation(
    element: HTMLElement,
    name: string,
    keyframes: string[] | number[],
    options: NativeAnimationOptions,
    onReady?: (animation: Animation) => void
): void {
    const id = element.dataset[optimizedAppearDataId]

    if (!id) return

    window.HandoffAppearAnimations = handoffOptimizedAppearAnimation

    const storeId = appearStoreId(id, name)

    /**
     * Use a dummy animation to detect when Chrome is ready to start
     * painting the page and hold off from triggering the real animation
     * until then.
     */
    const readyAnimation = animateStyle(
        element,
        name,
        [keyframes[0] as number, keyframes[0] as number],
        { duration: 1 }
    )

    appearAnimationStore.set(storeId, {
        animation: readyAnimation,
        ready: false,
    })

    const startAnimation = () => {
        const appearAnimation = animateStyle(element, name, keyframes, options)
        const current = document.timeline?.currentTime
        if (current) {
            appearAnimation.startTime = current
        }
        appearAnimationStore.set(storeId, { animation: appearAnimation, ready: true })

        if (onReady) onReady(appearAnimation)
    }

    if (readyAnimation.ready) {
        readyAnimation.ready.then(() => {
            readyAnimation.cancel()
            startAnimation()
        })
    } else {
        startAnimation()
    }
}
