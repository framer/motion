import "../../../../../jest.setup"
import { buildTransform } from "../build-transform"

describe("buildTransform", () => {
    it("Outputs 'none' when transformIsDefault is true", () => {
        expect(buildTransform({ x: 0 }, ["x"], undefined, true)).toBe("none")
    })

    it("Outputs the provided transform when transformIsDefault is false", () => {
        expect(
            buildTransform({ x: 0 }, ["x"], undefined, false, true, false)
        ).toBe("translateX(0) translateZ(0)")
    })

    it("Only outputs translateZ(0) if enableHardwareAcceleration is enabled", () => {
        expect(
            buildTransform({ x: 0 }, ["x"], undefined, false, false, false)
        ).toBe("translateX(0)")
    })

    it("Still outputs translateZ if z is explicitly assigned", () => {
        expect(
            buildTransform(
                { x: 0, z: "5px" },
                ["x", "z"],
                undefined,
                false,
                false,
                false
            )
        ).toBe("translateX(0) translateZ(5px)")
    })

    it("Correctly handles transformPerspective", () => {
        expect(
            buildTransform(
                { x: "100px", transformPerspective: "200px" },
                ["x", "transformPerspective"],
                undefined,
                false
            )
        ).toBe("perspective(200px) translateX(100px) translateZ(0)")
    })

    it("Correctly handles transformTemplate if provided", () => {
        expect(
            buildTransform(
                { x: "5px" },
                ["x"],
                ({ x }: { x: string }) => `translateX(${parseFloat(x) * 2}px)`,
                true,
                true,
                false
            )
        ).toBe("translateX(10px)")
    })

    it("Outputs transform values in the correct order", () => {
        expect(
            buildTransform(
                { scale: 2, rotate: "90deg", x: 0, y: "10px" },
                ["scale", "rotate", "y", "x"],
                undefined,
                true,
                true,
                false
            )
        ).toBe(
            "translateX(0) translateY(10px) scale(2) rotate(90deg) translateZ(0)"
        )
    })
})
