import "../../../../../jest.setup"
import { animateMini } from "../animate-style"
import "./polyfill"

/**
 * TODO: All tests currently have to define at least two keyframes
 * because the polyfill doesn't support partial keyframes.
 */
const duration = 0.001

describe("animateMini", () => {
    test("No type errors", async () => {
        const div = document.createElement("div")
        animateMini(
            div,
            { opacity: 0.6, "--css-var": 2 },
            {
                duration,
                "--css-var": {
                    repeatType: "mirror",
                },
                repeat: 0,
                ease: "easeOut",
                times: [0],
            }
        )
    })

    test("Applies target keyframe when animation has finished", async () => {
        const div = document.createElement("div")
        const animation = animateMini(
            div,
            { opacity: 0.6 },
            { duration, x: {}, "--css-var": {} }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.6")
        })
    })

    test("Applies final target keyframe when animation has finished", async () => {
        const div = document.createElement("div")
        const animation = animateMini(
            div,
            { opacity: [0.2, 0.5] },
            { duration }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.5")
        })
    })

    test("time sets and gets time", async () => {
        const div = document.createElement("div")
        const animation = animateMini(div, { opacity: 0.5 }, { duration: 10 })

        expect(animation.time).toBe(0)
        animation.time = 5
        expect(animation.time).toBe(5)
    })

    test("autoplay false pauses animation", async () => {
        const div = document.createElement("div")
        const animation = animateMini(
            div,
            { opacity: 0.5 },
            { duration: 0.1, autoplay: false }
        )
        let hasFinished = false

        animation.then(() => {
            hasFinished = true
        })

        await new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(hasFinished).toBe(false)
                resolve()
            }, 200)
        })
    })

    test("time can be set to duration", async () => {
        const div = document.createElement("div")
        div.style.opacity = "0"
        const animation = animateMini(div, { opacity: 0.5 }, { duration: 1 })
        animation.pause()
        animation.time = 1

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(div).toHaveStyle("opacity: 0.5")
                resolve()
            }, 50)
        })
    })

    test("duration gets the duration of the animation", async () => {
        const div = document.createElement("div")
        const animation = animateMini(div, { opacity: 0.5 }, { duration: 10 })

        expect(animation.duration).toBe(10)
    })

    test("Interrupt polyfilled transforms", async () => {
        const div = document.createElement("div")
        animateMini(div, { x: 300 }, { duration: 1 })

        const promise = new Promise<string | undefined>((resolve) => {
            setTimeout(() => {
                const animation = animateMini(div, { x: 0 }, { duration: 1 })
                setTimeout(() => {
                    animation.stop()
                    resolve(div.style.getPropertyValue("--motion-translateX"))
                }, 50)
            }, 100)
        })

        return expect(promise).resolves.not.toBe("0px")
    })
})
