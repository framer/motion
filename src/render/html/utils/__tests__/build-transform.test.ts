import "../../../../../jest.setup"
import { buildTransform } from "../build-transform"
import { isTransformProp } from "../transform"

describe("isTransformProp", () => {
    it("Correctly identifies only transformPerspective as a transform prop", () => {
        expect(isTransformProp("perspective")).toBe(false)
        expect(isTransformProp("transformPerspective")).toBe(true)
    })
    it("Correctly identifies translate and alias to be true", () => {
        expect(isTransformProp("x")).toBe(true)
        expect(isTransformProp("translateX")).toBe(true)
    })
})

describe("buildTransform", () => {
    it("Outputs 'none' when transformIsDefault is true", () => {
        expect(
            buildTransform(
                { transform: { x: 0 }, transformKeys: ["x"] } as any,
                {},
                true
            )
        ).toBe("none")
    })

    it("Outputs the provided transform when transformIsDefault is false", () => {
        expect(
            buildTransform(
                { transform: { x: 0 }, transformKeys: ["x"] } as any,
                { enableHardwareAcceleration: true, allowTransformNone: false },
                true
            )
        ).toBe("translateX(0) translateZ(0)")
    })

    it("Only outputs translateZ(0) if enableHardwareAcceleration is enabled", () => {
        expect(
            buildTransform(
                { transform: { x: 0 }, transformKeys: ["x"] } as any,
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
                {
                    transform: { x: 0, z: "5px" },
                    transformKeys: ["x", "z"],
                } as any,
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
                {
                    transform: { x: "100px", transformPerspective: "200px" },
                    transformKeys: ["x", "transformPerspective"],
                } as any,
                {},
                false
            )
        ).toBe("perspective(200px) translateX(100px) translateZ(0)")
    })

    it("Correctly handles transformTemplate if provided", () => {
        expect(
            buildTransform(
                { transform: { x: "5px" }, transformKeys: ["x"] } as any,
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
                    transform: { scale: 2, rotate: "90deg", x: 0, y: "10px" },
                    transformKeys: ["scale", "rotate", "y", "x"],
                } as any,

                { enableHardwareAcceleration: true, allowTransformNone: false },
                true
            )
        ).toBe(
            "translateX(0) translateY(10px) scale(2) rotate(90deg) translateZ(0)"
        )
    })
})
