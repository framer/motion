/**
 * Specifically match against false here as incomplete versions of
 * PointerEvents in very old browser might have it set as undefined.
 */
export const isPrimaryPointer = (event: PointerEvent) => {
    console.log(event)
    if (event.pointerType === "mouse") {
        return typeof event.button !== "number" || event.button <= 0
    } else {
        return event.isPrimary
    }
}
