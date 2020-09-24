export function isMouseEvent(event: PointerEvent) {
    return event.pointerType === "mouse"
}

export function isLeftClick(event: PointerEvent) {
    return isMouseEvent(event) && event.button === 0
}

export function isPrimaryPointer(event: PointerEvent) {
    let isPrimary = event.isPrimary

    if (event.pointerType === "mouse" && event.button !== 0) {
        isPrimary = false
    }

    return isPrimary
}
