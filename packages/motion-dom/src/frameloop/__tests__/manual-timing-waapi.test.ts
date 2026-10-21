/**
 * On a manual clock every animation must follow processFrame, including
 * values Motion would otherwise hand to WAAPI, which runs on the browser's
 * clock. Needed for frame-by-frame video rendering and timeline scrubbing.
 */
import { MotionGlobalConfig } from "motion-utils"
import { animateElement } from "../../animation/animate/element"
import { stepFrames, withManualFrames } from "./utils"

const animate = jest.fn(() => ({}))

beforeAll(() => {
    Object.defineProperty(Element.prototype, "animate", {
        value: animate,
        writable: true,
        configurable: true,
    })
})

afterAll(() => {
    delete (Element.prototype as any).animate
})

describe("WAAPI-eligible values on a manual clock", () => {
    withManualFrames()

    test.each([
        ["opacity", { opacity: [0, 1] }, "0.5"],
        ["transform", { x: [0, 100] }, "translateX(50px)"],
        ["filter", { filter: ["blur(0px)", "blur(10px)"] }, "blur(5px)"],
    ])("%s follows processFrame", async (name, keyframes, midpoint) => {
        const element = document.createElement("div")
        document.body.appendChild(element)

        animateElement(element, keyframes as any, {
            duration: 1,
            ease: "linear",
        })
        await stepFrames(500)

        const prop = name === "transform" ? "transform" : name
        expect(element.style[prop as any]).toBe(midpoint)
        expect(animate).not.toHaveBeenCalled()

        await stepFrames(500)
        element.remove()
    })
})

test("WAAPI is still used on the browser's clock", async () => {
    MotionGlobalConfig.useManualTiming = false
    const element = document.createElement("div")
    animateElement(element, { opacity: [0, 1] }, { duration: 1 })
    await new Promise((resolve) => requestAnimationFrame(resolve))
    await new Promise((resolve) => requestAnimationFrame(resolve))
    expect(animate).toHaveBeenCalled()
})
