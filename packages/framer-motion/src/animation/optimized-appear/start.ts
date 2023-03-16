import { appearStoreId } from "./store-id"
import { animateStyle } from "../animators/waapi"
import { NativeAnimationOptions } from "../animators/waapi/types"
import { optimizedAppearDataId } from "./data-id"
import { handoffOptimizedAppearAnimation } from "./handoff"
import { appearAnimationStore } from "./store"
import { noop } from "../../utils/noop"

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
     *
     * https://bugs.chromium.org/p/chromium/issues/detail?id=1406850
     */
    const readyAnimation = animateStyle(
        element,
        name,
        [keyframes[0] as number, keyframes[0] as number],
        /**
         * 10 secs is basically just a super-safe duration to give Chrome
         * long enough to get the animation ready.
         */
        { duration: 10000, ease: "linear" }
    )

    appearAnimationStore.set(storeId, {
        animation: readyAnimation,
        startTime: null,
    })

    const startAnimation = () => {
        readyAnimation.cancel()

        const appearAnimation = animateStyle(element, name, keyframes, options)
        if (document.timeline) {
            appearAnimation.startTime = document.timeline.currentTime
        }

        appearAnimationStore.set(storeId, {
            animation: appearAnimation,
            startTime: performance.now(),
        })

        if (onReady) onReady(appearAnimation)
    }

    if (readyAnimation.ready) {
        readyAnimation.ready.then(startAnimation).catch(noop)
    } else {
        startAnimation()
    }
}
