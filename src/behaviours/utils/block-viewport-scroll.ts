let isViewportScrollBlocked = false

window.addEventListener(
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
