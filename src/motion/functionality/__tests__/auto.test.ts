import { clamp, progress, mix } from "@popmotion/popcorn"

interface Axis {
    min: number
    max: number
}

interface Delta {
    translate: number
    scale: number
    origin: number
    originPoint: number
}

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

const clampProgress = clamp(0, 1)

function calcOrigin(before: Axis, after: Axis): number {
    let origin = 0.5
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    if (beforeSize > afterSize) {
        origin = progress(before.min, before.max - afterSize, after.min)
    } else {
        origin = progress(after.min, after.max - beforeSize, before.min)
    }

    return clampProgress(origin)
}

function calcTranslate(before: Axis, after: Axis, origin: number): number {
    const beforePoint = mix(before.min, before.max, origin)
    const afterPoint = mix(after.min, after.max, origin)
    return beforePoint - afterPoint
}

function calcDelta(before: Axis, after: Axis): Delta {
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    const scale = beforeSize / afterSize
    const origin = calcOrigin(before, after)
    const originPoint = after.min + origin * afterSize
    const translate = calcTranslate(before, after, origin)

    return { scale, translate, origin, originPoint }
}

function scaledPoint({ scale, originPoint }: Delta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

function applyDelta(delta: Delta, axis: Axis) {
    let min = axis.min
    let max = axis.max

    min = scaledPoint(delta, axis.min) + delta.translate
    max = scaledPoint(delta, axis.max) + delta.translate

    return { min, max }
}

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
    expect(calcOrigin({ min: 0, max: 100 }, { min: 0, max: 100 })).toBe(1)
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

test("calcDelta", () => {
    expect(calcDelta(aBefore, aAfter)).toEqual({
        translate: 100,
        origin: 0,
        originPoint: 0,
        scale: 1.5,
    })
    expect(calcDelta(bBefore, bAfter)).toEqual({
        translate: 0,
        origin: 1,
        originPoint: 300,
        scale: 1,
    })

    expect(calcDelta(cBefore, cAfter)).toEqual({
        translate: 0,
        origin: 0.5,
        originPoint: 400,
        scale: 2,
    })
})

test("applyDelta", () => {
    const aDelta = calcDelta(aBefore, aAfter)
    expect(applyDelta(aDelta, aAfter)).toEqual(aBefore)
    const bDelta = calcDelta(bBefore, bAfter)
    expect(applyDelta(bDelta, bAfter)).toEqual(bBefore)
    const cDelta = calcDelta(cBefore, cAfter)
    expect(applyDelta(cDelta, cAfter)).toEqual(cBefore)
})

test("applyDelta nested", () => {
    const outerBefore = { min: 0, max: 300 }
    const innerBefore = { min: 100, max: 200 }
    const outerAfter = { min: 400, max: 1000 }
    const innerAfter = { min: 650, max: 750 }

    const outerDelta = calcDelta(outerBefore, outerAfter)

    expect(applyDelta(outerDelta, outerAfter)).toEqual(outerBefore)

    const innerAfterNested = applyDelta(outerDelta, innerAfter)
    const innerNestedDelta = calcDelta(innerBefore, innerAfterNested)
    expect(applyDelta(innerNestedDelta, innerAfterNested)).toEqual(innerBefore)
})
