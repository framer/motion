export const enableTouchEvents = () => {
    const originalEvents = {
        ontouchstart: window.ontouchstart,
    }
    window.ontouchstart = null

    return () => {
        window.ontouchstart = originalEvents.ontouchstart
    }
}

export const enablePointerEvents = () => {
    const originalEvents = {
        onpointerdown: window.onpointerdown,
    }
    window.onpointerdown = null

    return () => {
        window.onpointerdown = originalEvents.onpointerdown
    }
}
