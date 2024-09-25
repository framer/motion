import { animateStyle } from "../animate-style"

/**
 * TODO: All tests currently have to define at least two keyframes
 * because the polyfill doesn't support partial keyframes.
 */
const duration = 0.001

describe("animateStyle", () => {
    test("No type errors", async () => {
        const div = document.createElement("div")
        const animation = animateStyle(
            div,
            { opacity: 0.6, x: 1, scale: 1, "--css-var": 2 },
            {
                duration,
                x: {},
                "--css-var": {
                    repeatType: "mirror",
                },
                repeat: 0,
                ease: "easeOut",
                times: [0],
            }
        )
        await animation.then(() => {
            expect(true).toBe(true)
        })
    })
})
