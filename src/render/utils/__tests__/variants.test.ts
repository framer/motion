import { animationControls } from "../../../animation/animation-controls"
import { getCurrentTreeVariant } from "../variants"

describe("getCurrentTreeVariant", () => {
    test("It returns the correct variant to render currently", () => {
        expect(
            getCurrentTreeVariant(
                {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                },
                {
                    currentVariant: "test",
                }
            )
        ).toEqual("test")

        expect(
            getCurrentTreeVariant(
                {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    inherit: false,
                },
                {
                    currentVariant: "test",
                }
            )
        ).toEqual(undefined)

        expect(
            getCurrentTreeVariant(
                {
                    initial: false,
                    animate: ["a", "b"],
                },
                {
                    currentVariant: "test",
                }
            )
        ).toEqual(["a", "b"])

        expect(
            getCurrentTreeVariant(
                {
                    initial: ["c", "d"],
                    animate: ["a", "b"],
                },
                {
                    currentVariant: "test",
                }
            )
        ).toEqual(["c", "d"])

        expect(
            getCurrentTreeVariant(
                {
                    initial: false,
                    animate: animationControls(),
                },
                {
                    currentVariant: "test",
                }
            )
        ).toEqual(undefined)
    })
})
