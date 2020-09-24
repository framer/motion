export function isMouseEvent(event: PointerEvent) {
    // It'd be preferable not to have this line but in testing environments PointerEvent doesn't exist.
    if (typeof PointerEvent === "undefined") return true

    return event.pointerType === "mouse"
}

export function isLeftClick(event: PointerEvent) {
    return isMouseEvent(event) && event.button === 0
}

export function isPrimaryPointer(event: PointerEvent) {
    // It'd be preferable not to have this line but in testing environments PointerEvent doesn't exist.
    if (typeof PointerEvent === "undefined") return true

    let isPrimary = event.isPrimary

    if (event.pointerType === "mouse" && event.button !== 0) {
        isPrimary = false
    }

    return isPrimary
}
