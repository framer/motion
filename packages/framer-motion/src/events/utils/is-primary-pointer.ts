/**
 * Specifically match against false here as incomplete versions of
 * PointerEvents in very old browser might have it set as undefined.
 */
export const isPrimaryPointer = (event: PointerEvent) =>
    event.isPrimary !== false
