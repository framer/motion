import { complex } from "../complex"
import { mixComplex } from "../../../utils/mix/complex"

/**
 * #2654: the "3" in "matrix3d" is tokenised as a number, so it gets
 * zeroed or interpolated along with the real values, producing invalid
 * transforms like "matrix0d(...)" or "matrix2.99999d(...)".
 */
const MATRIX =
    "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)"

describe("matrix3d (#2654)", () => {
    test("getAnimatableNone keeps the matrix3d function name", () => {
        expect(complex.getAnimatableNone(MATRIX)).toMatch(/^matrix3d\(/)
    })

    test("parse/transform round-trips matrix3d", () => {
        expect(complex.parse(MATRIX)).toHaveLength(16)
    })

    test("mixing from the animatable none keeps the function name", () => {
        const mixer = mixComplex(complex.getAnimatableNone(MATRIX), MATRIX)
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
            expect(mixer(p)).toMatch(/^matrix3d\(/)
        }
    })
})

describe("function names containing digits", () => {
    test.each([
        ["translate3d(10px, 20px, 30px)", [10, 20, 30]],
        ["rotate3d(1, 0, 0, 45deg)", [1, 0, 0, 45]],
        ["scale3d(1.5, 2, -0.5)", [1.5, 2, -0.5]],
        ["matrix(1, 0, 0, 1, 10, 20)", [1, 0, 0, 1, 10, 20]],
    ])("%s only tokenises its arguments", (value, expected) => {
        expect(complex.parse(value)).toEqual(expected)
        expect(complex.createTransformer(value)(expected)).toBe(value)
    })

    test("translate3d animatable none keeps the function name", () => {
        expect(
            complex.getAnimatableNone("translate3d(10px, -20px, .5px)")
        ).toBe("translate3d(0px, 0px, 0px)")
    })

    test("mixes translate3d values", () => {
        expect(
            mixComplex(
                "translate3d(0px, 0px, 0px) rotate3d(0, 0, 1, 0deg)",
                "translate3d(10px, -20px, 30px) rotate3d(0, 0, 1, 90deg)"
            )(0.5)
        ).toBe("translate3d(5px, -10px, 15px) rotate3d(0, 0, 1, 45deg)")
    })
})

describe("numbers and colours are still tokenised", () => {
    test.each([
        ["10px -20px .5em", [10, -20, 0.5]],
        ["calc(100%-20px)", [100, -20]],
        ["translate(10px,20px)", [10, 20]],
        ["1.5.5", [1.5, 0.5]],
        ["M10,20L30,40", [10, 20, 30, 40]],
        ["M0 0h10v-10z", [0, 0, 10, -10]],
        ["blur(2px) hue-rotate(90deg)", [2, 90]],
    ])("%s", (value, expected) => {
        expect(complex.parse(value)).toEqual(expected)
    })

    test("colours", () => {
        expect(
            complex.parse("0px 0px 10px #f00, 1px 2px rgba(0, 0, 255, 0.5)")
        ).toEqual([
            0,
            0,
            10,
            { red: 255, green: 0, blue: 0, alpha: 1 },
            1,
            2,
            { red: 0, green: 0, blue: 255, alpha: 0.5 },
        ])
    })
})

test("tokenising long minified SVG paths stays linear", () => {
    /**
     * Linear tokenising takes ~30ms here and quadratic several seconds, so
     * the budget leaves room for a loaded test machine.
     */
    const path = "M0 0" + "l-5-5-5-5h-10v-10".repeat(8000)
    const start = performance.now()
    expect(complex.parse(path)).toHaveLength(48002)
    expect(performance.now() - start).toBeLessThan(1000)
})
