export function isMouseEvent(
    event: MouseEvent | TouchEvent | PointerEvent
): event is MouseEvent {
    // PointerEvent inherits from MouseEvent so we can't use a straight instanceof check.
    if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
        return !!(event.pointerType === "mouse")
    }

    return event instanceof MouseEvent
}

export function isTouchEvent(
    event: MouseEvent | TouchEvent | PointerEvent
): event is TouchEvent {
    const hasTouches = !!(event as TouchEvent).touches
    return hasTouches
}
