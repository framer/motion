import {
    isTransitionDefined,
    convertTransitionToAnimationOptions,
    getDelayFromTransition,
    hydrateKeyframes,
    getAnimationOptions,
    getZeroUnit,
    isZero,
} from "../transitions"
import {
    underDampedSpring,
    criticallyDampedSpring,
    linearTween,
} from "../default-transitions"
import { noop } from "../../../utils/noop"
import { easeInOut } from "../../../easing/ease"
import { circIn } from "../../../easing/circ"

describe("isTransitionDefined", () => {
    test("Detects a transition", () => {
        expect(isTransitionDefined({})).toBe(false)
        expect(isTransitionDefined({ when: "beforeChildren" })).toBe(false)
        expect(isTransitionDefined({ delay: 0 })).toBe(false)
        expect(isTransitionDefined({ duration: 1 })).toBe(true)
        expect(isTransitionDefined({ delay: 0, duration: 1 })).toBe(true)
        expect(isTransitionDefined({ type: "tween" })).toBe(true)
        expect(isTransitionDefined({ ease: "linear" })).toBe(true)
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
            type: "tween",
        })

        expect(
            convertTransitionToAnimationOptions({
                duration: 1,
                type: "tween",
            })
        ).toEqual({
            duration: 1000,
            type: "tween",
        })

        expect(
            convertTransitionToAnimationOptions({
                repeat: Infinity,
            })
        ).toEqual({
            repeat: Infinity,
            type: "tween",
        })

        expect(
            convertTransitionToAnimationOptions({
                ease: "linear",
            })
        ).toEqual({
            ease: noop,
            type: "tween",
        })

        expect(
            convertTransitionToAnimationOptions({
                ease: ["easeInOut", "circIn"],
            })
        ).toEqual({
            ease: [easeInOut, circIn],
            type: "tween",
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

describe("getAnimationOptions", () => {
    test("Correctly creates a animate object", () => {
        expect(getAnimationOptions({}, { from: 0, to: 100 }, "x")).toEqual({
            from: 0,
            to: 100,
            ...underDampedSpring(),
        })
        expect(getAnimationOptions({}, { from: 0, to: 1 }, "scale")).toEqual({
            from: 0,
            to: 1,
            ...criticallyDampedSpring(1),
        })
        expect(getAnimationOptions({}, { from: 0, to: 1 }, "opacity")).toEqual({
            from: 0,
            to: 1,
            ...linearTween(),
            ease: noop,
            duration: 300,
        })

        expect(
            getAnimationOptions(
                { duration: 0.4 },
                { from: 0, to: 1 },
                "opacity"
            )
        ).toEqual({
            from: 0,
            to: 1,
            type: "tween",
            duration: 400,
        })

        expect(
            getAnimationOptions(
                { duration: 0.4 },
                { from: 50, to: [null, 100] },
                "x"
            )
        ).toEqual({
            from: 50,
            to: [50, 100],
            type: "tween",
            duration: 400,
        })

        expect(
            getAnimationOptions({}, { from: 50, to: [null, 100] }, "x")
        ).toEqual({
            from: 50,
            to: [50, 100],
            type: "tween",
            duration: 800,
        })

        expect(
            getAnimationOptions(
                { duration: 0.9 },
                { from: 50, to: [null, 100] },
                "x"
            )
        ).toEqual({
            from: 50,
            to: [50, 100],
            type: "tween",
            duration: 900,
        })

        expect(
            getAnimationOptions({ type: "tween" }, { from: 50, to: 100 }, "x")
        ).toEqual({
            from: 50,
            to: 100,
            type: "tween",
        })

        expect(
            getAnimationOptions(
                { duration: 0.4, times: [0, 0.4, 1] },
                { from: 50, to: [null, 100] },
                "x"
            )
        ).toEqual({
            duration: 400,
            type: "tween",
            offset: [0, 0.4, 1],
            from: 50,
            to: [50, 100],
        })
    })
})

describe("isZero", () => {
    test("correctly detects zero values", () => {
        expect(isZero(0)).toBe(true)
        expect(isZero("0px")).toBe(true)
        expect(isZero("0rem")).toBe(true)
        expect(isZero("4rem")).toBe(false)
        expect(isZero(5)).toBe(false)
        expect(isZero("#000")).toBe(false)
        expect(isZero("5%")).toBe(false)
        expect(isZero("0px 0px")).toBe(false)
    })
})

describe("getZeroUnit", () => {
    test("correctly converts zeroes to the unit type of provided value", () => {
        expect(getZeroUnit("5px")).toBe("0px")
        expect(getZeroUnit("5rem")).toBe("0rem")
        expect(getZeroUnit("5%")).toBe("0%")
        expect(getZeroUnit(5)).toBe(0)
        expect(getZeroUnit("solid")).toBe("solid")
        expect(getZeroUnit("#fff")).toBe("rgba(255, 255, 255, 1)")
    })
})
