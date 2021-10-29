import { animationControls } from "../../../animation/animation-controls"
import { getCurrentTreeVariants } from "../utils"

describe("getCurrentTreeVariants", () => {
    test("It returns the correct variant to render currently", () => {
        expect(
            getCurrentTreeVariants(
                {
                    initial: false,
                },
                {}
            )
        ).toEqual({})

        expect(
            getCurrentTreeVariants(
                {
                    initial: false,
                    animate: { opacity: 0 },
                },
                { animate: "hello" }
            )
        ).toEqual({ animate: "hello" })

        expect(
            getCurrentTreeVariants(
                {
                    initial: false,
                    animate: "hello",
                },
                {}
            )
        ).toEqual({
            initial: false,
            animate: "hello",
        })

        expect(
            getCurrentTreeVariants(
                {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                },
                {
                    initial: "a",
                    animate: "b",
                }
            )
        ).toEqual({ initial: "a", animate: "b" })

        expect(
            getCurrentTreeVariants(
                {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    inherit: false,
                },
                {
                    initial: "a",
                    animate: "b",
                }
            )
        ).toEqual({ initial: undefined, animate: undefined })

        expect(
            getCurrentTreeVariants(
                {
                    initial: false,
                    animate: ["a", "b"],
                },
                {
                    initial: "c",
                    animate: "b",
                }
            )
        ).toEqual({ initial: false, animate: ["a", "b"] })

        expect(
            getCurrentTreeVariants(
                {
                    initial: ["c", "d"],
                    animate: ["a", "b"],
                },
                {
                    initial: ["e", "f"],
                    animate: ["g", "h"],
                }
            )
        ).toEqual({
            initial: ["c", "d"],
            animate: ["a", "b"],
        })

        expect(
            getCurrentTreeVariants(
                {
                    initial: false,
                    animate: animationControls(),
                },
                {
                    initial: "a",
                    animate: "b",
                }
            )
        ).toEqual({ initial: false, animate: undefined })
    })
})
