import "../../../../../jest.setup"
import { buildTransform } from "../build-transform"

describe("buildTransform", () => {
    it("correctly builds transform strings", () => {
        expect(buildTransform({ x: 0 }, ["x"], undefined, true)).toBe("none")

        expect(
            buildTransform({ x: 0 }, ["x"], undefined, true, true, false)
        ).toBe("translateX(0) translateZ(0)")

        expect(
            buildTransform({ x: 0 }, ["x"], undefined, true, false, false)
        ).toBe("translateX(0)")

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

        expect(
            buildTransform({ z: "5px" }, ["z"], undefined, false, false)
        ).toBe("translateZ(5px)")
    })
})
