import { animate } from "../animate"
import { defaultOptions } from "../animators/waapi/__tests__/setup"

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

    test("Can override transition options per-value with legacy default option", async () => {
        const a = document.createElement("div")

        animate(
            a,
            { opacity: [0, 1], transform: ["scale(0)", "scale(1)"] },
            { default: { duration: 1 }, transform: { duration: 2 } }
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
})
