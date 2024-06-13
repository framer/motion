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
        expect(
            buildTransform(
                { transform: { x: 0 }, transformKeys: ["x"] } as any,
                true
            )
        ).toBe("none")
    })

    it("Correctly handles transformPerspective", () => {
        expect(
            buildTransform(
                {
                    transform: { x: "100px", transformPerspective: "200px" },
                    transformKeys: ["x", "transformPerspective"],
                } as any,
                false
            )
        ).toBe("perspective(200px) translateX(100px) translateZ(0)")
    })

    it("Correctly handles transformTemplate if provided", () => {
        expect(
            buildTransform(
                { transform: { x: "5px" }, transformKeys: ["x"] } as any,
                true,
                ({ x }: { x: string }) => `translateX(${parseFloat(x) * 2}px)`
            )
        ).toBe("translateX(10px)")
    })

    it("Outputs transform values in the correct order", () => {
        expect(
            buildTransform(
                {
                    transform: {
                        scale: 2,
                        rotate: "90deg",
                        x: 0,
                        y: "10px",
                        rotateZ: "190deg",
                    },
                    transformKeys: ["rotateZ", "scale", "rotate", "y", "x"],
                } as any,
                true
            )
        ).toBe(
            "translateX(0) translateY(10px) scale(2) rotate(90deg) rotateZ(190deg) translateZ(0)"
        )
    })
})
