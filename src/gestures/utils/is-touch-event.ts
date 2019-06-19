export function isTouchEvent(
    event: MouseEvent | TouchEvent
): event is TouchEvent {
    return !!(event as TouchEvent).touches
}
