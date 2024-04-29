import { mixComplex } from "../complex"

test("mixComplex", () => {
    const pxMixer = mixComplex("20px", "10px")
    expect(pxMixer(0)).toBe("20px")
    expect(pxMixer(0.5)).toBe("15px")
    expect(pxMixer(1)).toBe("10px")

    const mixedMixer = mixComplex(
        "20px, rgba(0, 0, 0, 0)",
        "10px, rgba(255, 255, 255, 1)"
    )
    expect(mixedMixer(0)).toBe("20px, rgba(0, 0, 0, 0)")
    expect(mixedMixer(0.5)).toBe("15px, rgba(180, 180, 180, 0.5)")
    expect(mixedMixer(1)).toBe("10px, rgba(255, 255, 255, 1)")

    const mixedLongHex = mixComplex("20px, #0000", "10px, #ffff")
    expect(mixedLongHex(0)).toBe("20px, rgba(0, 0, 0, 0)")
    expect(mixedLongHex(0.5)).toBe("15px, rgba(180, 180, 180, 0.5)")
    expect(mixedLongHex(1)).toBe("10px, rgba(255, 255, 255, 1)")
})

test("mixComplex gracefully handles numbers", () => {
    expect(mixComplex(20, "10")(0.5)).toBe("15")
})

test("mixComplex errors", () => {
    expect(mixComplex("hsla(100, 100%, 100%, 1)", "#fff")(0)).toBe(
        "hsla(100, 100%, 100%, 1)"
    )
    expect(mixComplex("hsla(100, 100%, 100%, 1)", "#fff")(0.1)).toBe(
        "rgba(255, 255, 255, 1)"
    )
})

test("mixComplex mixes var() and unit types", () => {
    expect(mixComplex("var(--test) 0px", "var(--test) 20px")(0.5)).toBe(
        "var(--test) 10px"
    )
    expect(mixComplex("var(--test-1) 10px", "var(--test-9) 60px")(0.5)).toBe(
        "var(--test-9) 35px"
    )
})

test("mixComplex can interpolate out-of-order values", () => {
    expect(mixComplex("#fff 0px 0px", "20px 0px #000")(0.5)).toBe(
        "10px 0px rgba(180, 180, 180, 1)"
    )
})

test("mixComplex can animate from a value-less prop", () => {
    expect(mixComplex("#fff 0 0px", "#000 20px 0px")(0.5)).toBe(
        "rgba(180, 180, 180, 1) 10px 0px"
    )
})

test("mixComplex can animate from a value with extra zeros", () => {
    expect(mixComplex("#fff 0 0px 0px", "20px 0px #000")(0.5)).toBe(
        "10px 0px rgba(180, 180, 180, 1)"
    )
})

test("mixComplex will only interpolate values outside of CSS variables", () => {
    const mixer = mixComplex(
        "#fff 0 var(--grey, 0px) 10px",
        "#000 0 var(--grey, 10px) 0px"
    )
    expect(mixer(0)).toBe("rgba(255, 255, 255, 1) 0 var(--grey, 0px) 10px")
    expect(mixer(0.5)).toBe("rgba(180, 180, 180, 1) 0 var(--grey, 10px) 5px")
    expect(mixer(1)).toBe("rgba(0, 0, 0, 1) 0 var(--grey, 10px) 0px")
})

test("mixComplex can animate between long and shorthand numerical values", () => {
    const shortToLong = mixComplex("2px", "4px 6px 8px")
    expect(shortToLong(0)).toBe("2px")
    expect(shortToLong(0.5)).toBe("3px 4px 5px")
    expect(shortToLong(1)).toBe("4px 6px 8px")

    const longToShort = mixComplex("4px 6px 8px", "2px")
    expect(longToShort(0)).toBe("4px 6px 8px")
    expect(longToShort(0.5)).toBe("3px 4px 5px")
    expect(longToShort(1)).toBe("2px")

    const shortToLongMulti = mixComplex("2px 4px", "4px 6px 8px 10px")
    expect(shortToLongMulti(0)).toBe("2px 4px")
    expect(shortToLongMulti(0.5)).toBe("3px 5px 5px 7px")
    expect(shortToLongMulti(1)).toBe("4px 6px 8px 10px")

    const longToShortMulti = mixComplex("4px 6px 8px 10px", "2px 4px")
    expect(longToShortMulti(0)).toBe("4px 6px 8px 10px")
    expect(longToShortMulti(0.5)).toBe("3px 5px 5px 7px")
    expect(longToShortMulti(1)).toBe("2px 4px")
})
