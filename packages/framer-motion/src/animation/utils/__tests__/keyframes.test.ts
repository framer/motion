import { motionValue } from "../../../value"
import { getKeyframes } from "../keyframes"

describe("getKeyframes", () => {
    test("Makes animatable 'none' from string target", () => {
        const keyframes = getKeyframes(
            motionValue("none"),
            "transform",
            "translateX(100px)",
            {}
        )
        expect(keyframes).toEqual(["translateX(0px)", "translateX(100px)"])
    })

    test("Makes animatable 'none' from keyframes target", () => {
        const a = getKeyframes(
            motionValue("none"),
            "transform",
            [null, "translateX(100px)"],
            {}
        )
        expect(a).toEqual(["translateX(0px)", "translateX(100px)"])

        const b = getKeyframes(
            motionValue("none"),
            "transform",
            [null, "translateX(100px)", null],
            {}
        )
        expect(b).toEqual([
            "translateX(0px)",
            "translateX(100px)",
            "translateX(100px)",
        ])
    })

    test("Replaces 'none' within keyframes", () => {
        const keyframes = getKeyframes(
            motionValue("translateX(200px)"),
            "transform",
            ["none", "translateX(100px)"],
            {}
        )
        expect(keyframes).toEqual(["translateX(0px)", "translateX(100px)"])
    })

    test("Fills wildcard keyframes", () => {
        const keyframes = getKeyframes(
            motionValue("none"),
            "transform",
            [null, null, "translateX(100px)", null],
            {}
        )
        expect(keyframes).toEqual([
            "translateX(0px)",
            "translateX(0px)",
            "translateX(100px)",
            "translateX(100px)",
        ])
    })

    test("from overrides current motion value", () => {
        const keyframes = getKeyframes(
            motionValue("translateX(1px)"),
            "transform",
            [null, null, "translateX(100px)", null],
            { from: "translateX(2px)" }
        )
        expect(keyframes).toEqual([
            "translateX(2px)",
            "translateX(2px)",
            "translateX(100px)",
            "translateX(100px)",
        ])
    })

    test("initial keyframe overrides from, if not null", () => {
        const keyframes = getKeyframes(
            motionValue("translateX(1px)"),
            "transform",
            ["translateX(3px)", null, "translateX(100px)", null],
            { from: "translateX(2px)" }
        )
        expect(keyframes).toEqual([
            "translateX(3px)",
            "translateX(3px)",
            "translateX(100px)",
            "translateX(100px)",
        ])
    })

    test("Matches value type of origin keyframe if zero/none", () => {
        const a = getKeyframes(motionValue(0), "transform", "50px", {})
        expect(a).toEqual(["0px", "50px"])
        const b = getKeyframes(motionValue("0"), "transform", "50px", {})
        expect(b).toEqual(["0px", "50px"])
        const c = getKeyframes(motionValue(2), "transform", [0, "50px"], {})
        expect(c).toEqual(["0px", "50px"])
        const d = getKeyframes(motionValue(2), "transform", ["0", "50px"], {})
        expect(d).toEqual(["0px", "50px"])
        const e = getKeyframes(
            motionValue(2),
            "transform",
            ["none", "50px"],
            {}
        )
        expect(e).toEqual(["0px", "50px"])

        const f = getKeyframes(motionValue("0px"), "transform", "50%", {})
        expect(f).toEqual(["0%", "50%"])
    })

    test("Matches value type of subsequent keyframes if zero/none", () => {
        const a = getKeyframes(motionValue("50px"), "transform", 0, {})
        expect(a).toEqual(["50px", "0px"])
        const b = getKeyframes(motionValue("50px"), "transform", "0", {})
        expect(b).toEqual(["50px", "0px"])
        const c = getKeyframes(
            motionValue(""),
            "transform",
            [0, "50px", null],
            {}
        )
        expect(c).toEqual(["0px", "50px", "50px"])
        const d = getKeyframes(
            motionValue(2),
            "transform",
            ["0", "50px", "none"],
            {}
        )
        expect(d).toEqual(["0px", "50px", "0px"])
        const e = getKeyframes(
            motionValue(2),
            "transform",
            ["none", "50px"],
            {}
        )
        expect(e).toEqual(["0px", "50px"])
    })

    test("Makes 0 motion value animatable to string", () => {
        const keyframes = getKeyframes(motionValue(0), "transform", "0%", {})
        expect(keyframes).toEqual(["0%", "0%"])
    })

    test("Makes 0 keyframe animatable to string", () => {
        const keyframes = getKeyframes(
            motionValue(0),
            "transform",
            [0, "0%"],
            {}
        )
        expect(keyframes).toEqual(["0%", "0%"])
    })
})
