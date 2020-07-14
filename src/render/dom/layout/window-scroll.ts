import { getFrameData } from "framesync"

let cachedWindowScroll = { x: 0, y: 0 }
let lastScrollCache = 0

/**
 * Get latest window scroll values. Use cached values if possible.
 */
export function getWindowScroll() {
    const { timestamp } = getFrameData()

    if (lastScrollCache !== timestamp) {
        cachedWindowScroll = {
            x: window.scrollX,
            y: window.scrollY,
        }
        lastScrollCache = timestamp
    }

    return cachedWindowScroll
}
