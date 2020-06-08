import {
    safeSize,
    calcOrigin,
    calcTranslate,
    calcDelta,
    scaledPoint,
    applyAxisDelta,
    getAnimatableValues,
    isTreeVisible,
    zeroDelta,
    resetBox,
    isNear,
    applyBoxDelta,
    applyTreeDeltas,
    fixTransparentRGBPair,
} from "../utils"
import { Axis, AxisBox2D } from "../../../../types/geometry"

describe("safeSize", () => {
    test("should return large bounding boxes as provided", () => {
        expect(
            safeSize({
                x: { min: 100, max: 200 },
                y: { min: 0, max: 100 },
            })
        ).toEqual({
            x: { min: 100, max: 200 },
            y: { min: 0, max: 100 },
        })
    })

    test("should return small bounding boxes as 1x1px min", () => {
        expect(
            safeSize({
                x: { min: 0, max: 0 },
                y: { min: 0, max: 0 },
            })
        ).toEqual({
            x: { min: -0.5, max: 0.5 },
            y: { min: -0.5, max: 0.5 },
        })
    })
})

test("scaledPoint", () => {
    expect(
        scaledPoint({ scale: 2, originPoint: 0, origin: 0, translate: 0 }, 100)
    ).toEqual(200)
    expect(
        scaledPoint(
            { scale: 0.5, originPoint: 0, origin: 0, translate: 0 },
            100
        )
    ).toEqual(50)
    expect(
        scaledPoint(
            { scale: 3, originPoint: 500, origin: 0, translate: 0 },
            100
        )
    ).toEqual(-700)
})

test("calcOrigin", () => {
    expect(calcOrigin({ min: 0, max: 100 }, { min: 0, max: 100 })).toBe(0.5)
    expect(calcOrigin({ min: -100, max: 100 }, { min: -50, max: 50 })).toBe(0.5)
    expect(calcOrigin({ min: -50, max: 50 }, { min: -100, max: 100 })).toBe(0.5)
    expect(calcOrigin({ min: 200, max: 200 }, { min: 0, max: 100 })).toBe(1)
    expect(calcOrigin({ min: 200, max: 200 }, { min: 300, max: 500 })).toBe(0)
})

test("calcTranslate", () => {
    // Same size, static
    expect(calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 0.5)).toBe(
        0
    )
    expect(calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 1)).toBe(0)
    expect(calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 0)).toBe(0)

    // Same size, translated
    expect(calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 0)).toBe(
        -100
    )
    expect(
        calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 0.5)
    ).toBe(-100)
    expect(calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 1)).toBe(
        -100
    )

    // Different size, static
    expect(
        calcTranslate({ min: 400, max: 500 }, { min: 400, max: 700 }, 0)
    ).toBe(0)
    expect(
        calcTranslate({ min: 400, max: 500 }, { min: 200, max: 700 }, 0.5)
    ).toBe(0)

    // Different size, translated
    expect(
        calcTranslate({ min: 200, max: 400 }, { min: 400, max: 800 }, 0.5)
    ).toBe(-300)
    expect(
        calcTranslate({ min: 400, max: 800 }, { min: 200, max: 400 }, 0)
    ).toBe(200)
})

const aBefore: Axis = {
    min: 100,
    max: 400,
}

const aAfter: Axis = {
    min: 0,
    max: 200,
}

const bBefore: Axis = {
    min: 200,
    max: 300,
}

const bAfter: Axis = {
    min: 200,
    max: 300,
}

const cBefore: Axis = {
    min: 300,
    max: 500,
}

const cAfter: Axis = {
    min: 350,
    max: 450,
}

test("calcDelta", () => {
    const delta = {
        translate: 0,
        origin: 0,
        originPoint: 0,
        scale: 0,
    }
    calcDelta(delta, aBefore, aAfter)
    expect(delta).toEqual({
        translate: 100,
        origin: 0,
        originPoint: 0,
        scale: 1.5,
    })
    calcDelta(delta, bBefore, bAfter)
    expect(delta).toEqual({
        translate: 0,
        origin: 0.5,
        originPoint: 250,
        scale: 1,
    })
    calcDelta(delta, cBefore, cAfter)
    expect(delta).toEqual({
        translate: 0,
        origin: 0.5,
        originPoint: 400,
        scale: 2,
    })
})

test("applyAxisDelta", () => {
    const delta = {
        translate: 0,
        origin: 0,
        originPoint: 0,
        scale: 0,
    }

    const a = { ...aAfter }
    calcDelta(delta, aBefore, a)
    applyAxisDelta(a, delta)
    expect(a).toEqual(aBefore)

    const b = { ...bAfter }
    calcDelta(delta, bBefore, b)
    applyAxisDelta(b, delta)
    expect(b).toEqual(bBefore)

    const c = { ...cAfter }
    calcDelta(delta, cBefore, c)
    applyAxisDelta(c, delta)
    expect(c).toEqual(cBefore)
})

test("applyBoxDelta", () => {
    const a = {
        x: { min: 100, max: 200 },
        y: { min: 300, max: 400 },
    }

    applyBoxDelta(a, {
        x: {
            translate: 100,
            scale: 2,
            origin: 0.5,
            originPoint: 150,
        },
        y: {
            translate: -100,
            scale: 0.5,
            origin: 0.5,
            originPoint: 350,
        },
        isVisible: true,
    })

    expect(a).toEqual({
        x: { min: 150, max: 350 },
        y: { min: 225, max: 275 },
    })
})

test("applyTreeDelta", () => {
    const a = {
        x: { min: 100, max: 200 },
        y: { min: 300, max: 400 },
    }

    const scale = { x: 1, y: 1 }

    const delta = {
        x: {
            translate: 100,
            scale: 2,
            origin: 0.5,
            originPoint: 150,
        },
        y: {
            translate: -100,
            scale: 0.5,
            origin: 0.5,
            originPoint: 350,
        },
        isVisible: true,
    }

    applyTreeDeltas(a, scale, [delta, delta])

    expect(a).toEqual({
        x: { min: 250, max: 650 },
        y: { min: 187.5, max: 212.5 },
    })
    expect(scale).toEqual({
        x: 4,
        y: 0.25,
    })
})

test("getAnimatableValues", () => {
    expect(
        getAnimatableValues({
            a: { createUpdater: () => () => "" },
            b: {},
        })
    ).toEqual(["b"])
})

test("isTreeVisible", () => {
    expect(
        isTreeVisible([
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: true,
            },
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: true,
            },
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: true,
            },
        ])
    ).toEqual(true)
    expect(
        isTreeVisible([
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: true,
            },
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: false,
            },
            {
                x: zeroDelta,
                y: zeroDelta,
                isVisible: true,
            },
        ])
    ).toEqual(false)
})

describe("resetBox", () => {
    test("it resets the provided box to the origin box", () => {
        const box: AxisBox2D = {
            x: { min: 100, max: 200 },
            y: { min: 100, max: 200 },
        }

        resetBox(box, {
            x: { min: -100, max: 100 },
            y: { min: 5, max: 10 },
        })

        expect(box).toEqual({
            x: { min: -100, max: 100 },
            y: { min: 5, max: 10 },
        })
    })
})

describe("isNear", () => {
    test("detects when a number is near another within the default maxDistance", () => {
        expect(isNear(10, 10.005)).toBe(true)
        expect(isNear(10, 9.995)).toBe(true)
        expect(isNear(10, 11)).toBe(false)
        expect(isNear(10, 9)).toBe(false)
    })
    test("detects when a number is near another within a provided maxDistance", () => {
        expect(isNear(10, 10.95, 1)).toBe(true)
        expect(isNear(10, 9.05, 1)).toBe(true)
        expect(isNear(10, 11, 1)).toBe(false)
        expect(isNear(10, 9, 1)).toBe(false)
    })
})

describe("fixTransparentRGBPair", () => {
    test("Leaves non-transparent values as-is", () => {
        expect(
            fixTransparentRGBPair("rgba(1,0,0,0)", "rgba(255,255,255,1)")
        ).toEqual(["rgba(1, 0, 0, 0)", "rgba(255, 255, 255, 1)"])
    })
    test("Convert transparent black values to a transparent version of the other color", () => {
        expect(
            fixTransparentRGBPair("rgba(0,0,0,0)", "rgba(255,255,255,1)")
        ).toEqual(["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"])
        expect(
            fixTransparentRGBPair("rgba(255,255,255,1)", "rgba(0,0,0,0)")
        ).toEqual(["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)"])
    })
})
