import { isWaapiSupportedEasing } from "../easing"

test("isWaapiSupportedEasing", () => {
    expect(isWaapiSupportedEasing()).toEqual(true)
    expect(isWaapiSupportedEasing("linear")).toEqual(true)
    expect(isWaapiSupportedEasing("easeIn")).toEqual(true)
    expect(isWaapiSupportedEasing("anticipate")).toEqual(false)
    expect(isWaapiSupportedEasing("backInOut")).toEqual(false)
    expect(isWaapiSupportedEasing([0, 1, 2, 3])).toEqual(true)
    expect(isWaapiSupportedEasing((v) => v)).toEqual(false)
    expect(isWaapiSupportedEasing(["linear", "easeIn"])).toEqual(true)
    expect(isWaapiSupportedEasing(["linear", "easeIn", [0, 1, 2, 3]])).toEqual(
        true
    )
    expect(isWaapiSupportedEasing(["linear", "easeIn", "anticipate"])).toEqual(
        false
    )
    expect(isWaapiSupportedEasing(["linear", "easeIn", (v) => v])).toEqual(
        false
    )
})
