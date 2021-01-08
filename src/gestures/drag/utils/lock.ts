export type Lock = (() => void) | false

export function createLock(name: string) {
    let lock: null | string = null
    return (): Lock => {
        const openLock = (): void => {
            lock = null
        }
        if (lock === null) {
            lock = name
            return openLock
        }
        return false
    }
}

const globalHorizontalLock = createLock("dragHorizontal")
const globalVerticalLock = createLock("dragVertical")

export function getGlobalLock(
    drag: boolean | "x" | "y" | "lockDirection"
): Lock {
    let lock: Lock = false
    if (drag === "y") {
        lock = globalVerticalLock()
    } else if (drag === "x") {
        lock = globalHorizontalLock()
    } else {
        const openHorizontal = globalHorizontalLock()
        const openVertical = globalVerticalLock()
        if (openHorizontal && openVertical) {
            lock = () => {
                openHorizontal()
                openVertical()
            }
        } else {
            // Release the locks because we don't use them
            if (openHorizontal) openHorizontal()
            if (openVertical) openVertical()
        }
    }
    return lock
}

export function isDragActive() {
    // Check the gesture lock - if we get it, it means no drag gesture is active
    // and we can safely fire the tap gesture.
    const openGestureLock = getGlobalLock(true)
    if (!openGestureLock) return true
    openGestureLock()
    return false
}
