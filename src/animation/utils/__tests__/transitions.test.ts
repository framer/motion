import {
    isTransitionDefined,
    convertTransitionToAnimationOptions,
    getDelayFromTransition,
    hydrateKeyframes,
} from "../transitions"
import { linear, easeInOut, circIn } from "popmotion"

describe("isTransitionDefined", () => {
    test("Detects a transition", () => {
        expect(isTransitionDefined({})).toBe(false)
        expect(isTransitionDefined({ when: "beforeChildren" })).toBe(false)
        expect(isTransitionDefined({ delay: 0 })).toBe(false)
        expect(isTransitionDefined({ duration: 1 })).toBe(true)
        expect(isTransitionDefined({ delay: 0, duration: 1 })).toBe(true)
    })
})

describe("convertTransitionToAnimationOptions", () => {
    test("Converts transition options", () => {
        expect(
            convertTransitionToAnimationOptions({
                duration: 1,
                repeatDelay: 2,
            })
        ).toEqual({
            duration: 1000,
            repeatDelay: 2000,
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                duration: 1,
                type: "tween",
            })
        ).toEqual({
            duration: 1000,
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                loop: Infinity,
            })
        ).toEqual({
            repeat: Infinity,
            repeatType: "loop",
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                repeat: Infinity,
            })
        ).toEqual({
            repeat: Infinity,
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                yoyo: Infinity,
                type: "spring",
            })
        ).toEqual({
            repeat: Infinity,
            repeatType: "reverse",
            type: "spring",
        })

        expect(
            convertTransitionToAnimationOptions({
                flip: Infinity,
            })
        ).toEqual({
            repeat: Infinity,
            repeatType: "mirror",
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                ease: "linear",
            })
        ).toEqual({
            ease: linear,
            type: "keyframes",
        })

        expect(
            convertTransitionToAnimationOptions({
                ease: ["easeInOut", "circIn"],
            })
        ).toEqual({
            ease: [easeInOut, circIn],
            type: "keyframes",
        })
    })
})

describe("getDelayFromTransition", () => {
    test("Returns the most value-specific delay for a value", () => {
        expect(getDelayFromTransition({ x: {} }, "x")).toBe(0)
        expect(getDelayFromTransition({ delay: 100 }, "x")).toBe(100)
        expect(
            getDelayFromTransition({ delay: 100, default: { delay: 50 } }, "x")
        ).toBe(50)
        expect(
            getDelayFromTransition({ delay: 100, x: { delay: 50 } }, "x")
        ).toBe(50)
        expect(
            getDelayFromTransition(
                { delay: 100, default: {}, x: { delay: 0 } },
                "x"
            )
        ).toBe(0)
    })
})

describe("hydrateKeyframes", () => {
    test("Replaces null with from", () => {
        const opts = {
            from: 1,
            to: [null, 2, 3],
        }
        hydrateKeyframes(opts)
        expect(opts).toEqual({
            from: 1,
            to: [1, 2, 3],
        })
    })

    test("Leaves to alone if first value is not null", () => {
        const opts = {
            from: 1,
            to: [2, 2, 3],
        }
        hydrateKeyframes(opts)
        expect(opts).toEqual({
            from: 1,
            to: [2, 2, 3],
        })
    })
})
