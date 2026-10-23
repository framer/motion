import { mixColor, mixColorsLikeBrowser, mixLinearColor } from "../color"
import { mix } from ".."

test("mixColor hex", () => {
    expect(mixColor("#fff", "#000")(0.5)).toBe("rgba(180, 180, 180, 1)")
})

test("mixColor hex with alpha", () => {
    expect(mixColor("#ffffff00", "#000000ff")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor hex with some alpha", () => {
    expect(mixColor("#ffffff00", "#000000")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor rgba", () => {
    expect(mixColor("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 1)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor rgba out of bounds", () => {
    expect(mixColor("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 1)")(2)).toBe(
        "rgba(255, 255, 255, 1)"
    )
    expect(mixColor("rgba(0, 0, 0, 0)", "rgba(255, 255, 255, 1)")(-1)).toBe(
        "rgba(0, 0, 0, 0)"
    )
})

test("mixColor rgb", () => {
    expect(mixColor("rgb(0, 0, 0)", "rgba(255, 255, 255)")(0.5)).toBe(
        "rgba(180, 180, 180, 1)"
    )
})

test("mixColor rgb out of bounds", () => {
    expect(mixColor("rgb(0, 0, 0)", "rgba(255, 255, 255)")(2)).toBe(
        "rgba(255, 255, 255, 1)"
    )
    expect(mixColor("rgb(0, 0, 0)", "rgba(255, 255, 255)")(-1)).toBe(
        "rgba(0, 0, 0, 1)"
    )
})

test("mixColor hsla", () => {
    expect(mixColor("hsla(0, 0%, 0%, 0)", "hsla(0, 0%, 100%, 1)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )

    expect(
        mixColor(
            "hsla(177, 37.4978%, 76.66804%, 1)",
            "hsla(0, 0%, 100%, 1)"
        )(0.5)
    ).toBe("rgba(218, 237, 236, 1)")
})

test("mixColor hsla out of bounds", () => {
    expect(mixColor("hsla(120, 0%, 0%, 0)", "hsla(360, 100%, 50%, 1)")(2)).toBe(
        "rgba(255, 0, 0, 1)"
    )
    expect(
        mixColor("hsla(120, 0%, 0%, 0)", "hsla(360, 100%, 50%, 1)")(-1)
    ).toBe("rgba(0, 0, 0, 0)")
})

test("mixColor hsl", () => {
    expect(mixColor("hsl(120, 0%, 0%)", "hsl(360, 100%, 50%)")(0.5)).toBe(
        "rgba(180, 0, 0, 1)"
    )
})

test("mixColor hsl out of bounds", () => {
    expect(mixColor("hsl(120, 0%, 0%)", "hsl(360, 100%, 50%)")(2)).toBe(
        "rgba(255, 0, 0, 1)"
    )
    expect(mixColor("hsl(120, 0%, 0%)", "hsl(360, 100%, 50%)")(-1)).toBe(
        "rgba(0, 0, 0, 1)"
    )
})

test("mixColor rgb to hex", () => {
    expect(mixColor("rgb(255, 255, 255)", "#000")(0.5)).toBe(
        "rgba(180, 180, 180, 1)"
    )
})

test("mixColor hsla to rgba", () => {
    expect(mixColor("hsla(0, 0, 0, 0)", "rgba(255, 255, 255, 1)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor hsla to hex", () => {
    expect(mixColor("hsla(0, 0, 0, 0)", "#fff")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor hex to hsla", () => {
    expect(mixColor("#fff", "hsla(0, 0, 0, 0)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor rgba to hsla", () => {
    expect(mixColor("rgba(255, 255, 255, 1)", "hsla(0, 0, 0, 0)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor rgba with slash to rgba without", () => {
    expect(mixColor("rgb(255, 255, 255 / 1)", "rgba(0, 0, 0, 0)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("mixColor rgba with slash (without slash spaces) to rgba without", () => {
    expect(mixColor("rgb(255 255 255/1)", "rgba(0, 0, 0, 0)")(0.5)).toBe(
        "rgba(180, 180, 180, 0.5)"
    )
})

test("doesn't return NaN", () => {
    expect(mixLinearColor(255, 0, 2)).not.toBeNaN()
})

test("mixColor mixes immediately with unknown color", () => {
    expect(mixColor("red", "rgba(0, 0, 0, 0)")(0)).toBe("red")
    expect(mixColor("red", "rgba(0, 0, 0, 0)")(0.5)).toBe("rgba(0, 0, 0, 0)")
    expect(mixColor("red", "rgba(0, 0, 0, 0)")(1)).toBe("rgba(0, 0, 0, 0)")
})

/**
 * Expected values are what Chrome's WAAPI renders for these keyframes with
 * linear easing, sampled with getComputedStyle.
 */
describe("mixColorsLikeBrowser", () => {
    function likeBrowser<T>(create: () => T) {
        mixColorsLikeBrowser(true)
        const mixer = create()
        mixColorsLikeBrowser(false)
        return mixer
    }

    test("mixes in sRGB", () => {
        const mixer = likeBrowser(() =>
            mixColor("rgb(255, 0, 0)", "rgb(0, 0, 255)")
        )
        expect(mixer(0.333)).toBe("rgba(170, 0, 85, 1)")
        expect(mixer(0.45)).toBe("rgba(140, 0, 115, 1)")
        expect(mixer(0.777)).toBe("rgba(57, 0, 198, 1)")
    })

    test("mixes hsla in sRGB", () => {
        const mixer = likeBrowser(() =>
            mixColor("#f00", "hsla(240, 100%, 50%, 1)")
        )
        expect(mixer(0.45)).toBe("rgba(140, 0, 115, 1)")
    })

    test("mixes with premultiplied alpha", () => {
        const mixer = likeBrowser(() =>
            mixColor("rgba(255, 0, 0, 0.2)", "rgba(0, 0, 255, 1)")
        )
        expect(mixer(0.333)).toBe("rgba(73, 0, 182, 0.4664)")
        expect(mixer(0.45)).toBe("rgba(50, 0, 205, 0.56)")

        const fromTransparent = likeBrowser(() =>
            mixColor("rgba(0, 0, 0, 0)", "rgb(255, 0, 0)")
        )
        expect(fromTransparent(0)).toBe("rgba(0, 0, 0, 0)")
        expect(fromTransparent(0.45)).toBe("rgba(255, 0, 0, 0.45)")
    })

    test("mixes colors in complex values", () => {
        const mixer = likeBrowser(() =>
            mix(
                "drop-shadow(0px 0px 0px rgb(255, 0, 0))",
                "drop-shadow(0px 0px 0px rgb(0, 0, 255))"
            )
        )
        expect(mixer(0.45)).toBe(
            "drop-shadow(0px 0px 0px rgba(140, 0, 115, 1))"
        )
    })

    test("only affects mixers created while on", () => {
        likeBrowser(() => mixColor("#f00", "#00f"))
        expect(mixColor("#fff", "#000")(0.5)).toBe("rgba(180, 180, 180, 1)")
    })
})
