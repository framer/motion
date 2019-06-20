export function isTouchEvent(
    event: MouseEvent | TouchEvent
): event is TouchEvent {
    const hasTouches = !!(event as TouchEvent).touches
    return hasTouches
}
