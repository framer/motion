export const enablePointerEvents = () => {
    const originalEvents = {
        onpointerdown: window.onpointerdown,
    }
    window.onpointerdown = null

    return () => {
        window.onpointerdown = originalEvents.onpointerdown
    }
}
