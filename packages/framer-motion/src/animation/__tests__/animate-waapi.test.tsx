import { animate } from "../animate"
import { defaultOptions } from "../animators/waapi/__tests__/setup"
import { stagger } from "../utils/stagger"

describe("animate() with WAAPI", () => {
    test("Can override transition options per-value", async () => {
        const a = document.createElement("div")

        animate(
            a,
            { opacity: [0, 1], transform: ["scale(0)", "scale(1)"] },
            { duration: 1, transform: { duration: 2 } }
        )

        expect(a.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            { ...defaultOptions, duration: 1000 }
        )

        expect(a.animate).toBeCalledWith(
            { transform: ["scale(0)", "scale(1)"], offset: undefined },
            { ...defaultOptions, duration: 2000 }
        )
    })

    test("Applies stagger", async () => {
        const a = document.createElement("div")
        const b = document.createElement("div")
        const animation = animate(
            [a, b],
            { opacity: [0.2, 0.5] },
            { delay: stagger(0.2) }
        )

        await animation.then(() => {
            expect(a.animate).toBeCalled()
            expect(a.animate).toBeCalledWith(
                { opacity: [0.2, 0.5], offset: undefined },
                {
                    delay: -0,
                    duration: 300,
                    easing: "cubic-bezier(0.25, 0.1, 0.35, 1)",
                    iterations: 1,
                    direction: "normal",
                    fill: "both",
                }
            )
            expect(b.animate).toBeCalled()
            expect(b.animate).toBeCalledWith(
                { opacity: [0.2, 0.5], offset: undefined },
                {
                    delay: 200,
                    duration: 300,
                    easing: "cubic-bezier(0.25, 0.1, 0.35, 1)",
                    iterations: 1,
                    direction: "normal",
                    fill: "both",
                }
            )
        })
    })
})
