export const enableTouchEvents = () => {
    const originalEvents = {
        ontouchstart: window.ontouchstart,
        ontouchmove: window.ontouchmove,
        ontouchend: window.ontouchend,
    }
    window.ontouchstart = null
    window.ontouchmove = null
    window.ontouchend = null
    return () => {
        window.ontouchstart = originalEvents.ontouchstart
        window.ontouchmove = originalEvents.ontouchmove
        window.ontouchend = originalEvents.ontouchend
    }
}

export const enablePointerEvents = () => {
    const originalEvents = {
        onpointerdown: window.onpointerdown,
        onpointermove: window.onpointermove,
        onpointerup: window.onpointerup,
    }
    window.onpointerdown = null
    window.onpointermove = null
    window.onpointerup = null
    return () => {
        window.onpointerdown = originalEvents.onpointerdown
        window.onpointermove = originalEvents.onpointermove
        window.onpointerup = originalEvents.onpointerup
    }
}
