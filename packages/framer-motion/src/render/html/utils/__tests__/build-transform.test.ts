import "../../../../../jest.setup"
import { buildTransform } from "../build-transform"
import { transformProps } from "../transform"

describe("transformProps.has", () => {
    it("Correctly identifies only transformPerspective as a transform prop", () => {
        expect(transformProps.has("perspective")).toBe(false)
        expect(transformProps.has("transformPerspective")).toBe(true)
    })
    it("Correctly identifies translate and alias to be true", () => {
        expect(transformProps.has("x")).toBe(true)
        expect(transformProps.has("translateX")).toBe(true)
    })
})

describe("buildTransform", () => {
    it("Outputs 'none' when transformIsDefault is true", () => {
        expect(buildTransform({ x: 0 }, {}, true)).toBe("none")
    })

    it("Outputs the provided transform when transformIsDefault is false", () => {
        expect(
            buildTransform(
                { x: 0 },
                { enableHardwareAcceleration: true, allowTransformNone: false },
                true
            )
        ).toBe("translateX(0) translateZ(0)")
    })

    it("Only outputs translateZ(0) if enableHardwareAcceleration is enabled", () => {
        expect(
            buildTransform(
                { x: 0 },
                {
                    enableHardwareAcceleration: false,
                    allowTransformNone: false,
                },
                false
            )
        ).toBe("translateX(0)")
    })

    it("Still outputs translateZ if z is explicitly assigned", () => {
        expect(
            buildTransform(
                { x: 0, z: "5px" },
                {
                    enableHardwareAcceleration: false,
                    allowTransformNone: false,
                },
                false
            )
        ).toBe("translateX(0) translateZ(5px)")
    })

    it("Correctly handles transformPerspective", () => {
        expect(
            buildTransform(
                { x: "100px", transformPerspective: "200px" },
                {},
                false
            )
        ).toBe("perspective(200px) translateX(100px) translateZ(0)")
    })

    it("Correctly handles transformTemplate if provided", () => {
        expect(
            buildTransform(
                { x: "5px" },
                { enableHardwareAcceleration: true, allowTransformNone: false },
                true,
                ({ x }: { x: string }) => `translateX(${parseFloat(x) * 2}px)`
            )
        ).toBe("translateX(10px)")
    })

    it("Outputs transform values in the correct order", () => {
        expect(
            buildTransform(
                {
                    scale: 2,
                    rotate: "90deg",
                    x: 0,
                    y: "10px",
                    rotateZ: "190deg",
                },

                { enableHardwareAcceleration: true, allowTransformNone: false },
                true
            )
        ).toBe(
            "translateX(0) translateY(10px) scale(2) rotate(90deg) rotateZ(190deg) translateZ(0)"
        )
    })
})
