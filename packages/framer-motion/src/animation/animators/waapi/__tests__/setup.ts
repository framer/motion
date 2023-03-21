export const setupWaapi = () => {
    /**
     * This assignment prevents Jest from complaining about
     * .animate() being undefined (as it's unsupported in node).
     */
    Element.prototype.animate = (() => {}) as any

    jest.spyOn(Element.prototype, "animate").mockImplementation(
        (
            _keyframes: Keyframe[] | null | PropertyIndexedKeyframes,
            _options: KeyframeAnimationOptions | number | undefined
        ) => {
            const animation = {
                cancel: () => {},
                finished: {
                    then: (resolve: VoidFunction) => {
                        resolve()
                        return Promise.resolve()
                    },
                },
            } as any

            setTimeout(() => {
                animation.onfinish?.()
            }, 0)

            return animation
        }
    )
}

export const restoreWaapi = () => {
    Element.prototype.animate = undefined as any
    jest.restoreAllMocks()
}

beforeEach(() => {
    setupWaapi()
})

afterEach(() => {
    restoreWaapi()
})

export const defaultOptions = {
    delay: -0,
    duration: 300,
    easing: "ease-out",
    iterations: 1,
    direction: "normal",
    fill: "both",
}
