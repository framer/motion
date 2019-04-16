import { safeWindow } from "../../events/utils/window"

let isViewportScrollBlocked = false

safeWindow.addEventListener(
    "touchmove",
    (event: TouchEvent) => {
        if (isViewportScrollBlocked) {
            event.preventDefault()
        }
    },
    { passive: false }
)

export const blockViewportScroll = () => (isViewportScrollBlocked = true)
export const unblockViewportScroll = () => (isViewportScrollBlocked = false)
