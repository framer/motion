export interface PressGestureInfo {
    success: boolean
}

export type OnPressEndEvent = (
    event: PointerEvent,
    info: PressGestureInfo
) => void

export type OnPressStartEvent = (event: PointerEvent) => OnPressEndEvent | void
