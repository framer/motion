export function isMouseEvent(event) {
    // PointerEvent inherits from MouseEvent so we can't use a straight instanceof check.
    if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
        return !!(event.pointerType === "mouse");
    }
    return event instanceof MouseEvent;
}
export function isTouchEvent(event) {
    var hasTouches = !!event.touches;
    return hasTouches;
}
//# sourceMappingURL=event-type.js.map