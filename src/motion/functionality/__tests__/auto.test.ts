import { clamp, progress } from "@popmotion/popcorn"

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

// const bBefore: Axis = {
//     min: 200,
//     max: 300,
// }

// const bAfter: Axis = {
//     min: 200,
//     max: 300,
// }

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

function calcDelta(before: Axis, after: Axis): Delta {
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    const scale = beforeSize / afterSize
    const origin = calcOrigin(before, after)
    const originPoint = after.min + origin * afterSize

    return {
        scale,
        translate: -1,
        origin,
        originPoint,
    }
}

function scaledPoint({ scale, originPoint }: Delta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

// function applyDelta(delta: Delta, axis: Axis) {
//     let min = axis.min
//     let max = axis.max

//     min = scaledPoint(delta, axis.min)
//     max = scaledPoint(delta, axis.max)

//     return { min, max }
// }

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

test("calcDelta", () => {
    expect(calcDelta(aBefore, aAfter)).toEqual({
        translate: -1,
        origin: 0,
        originPoint: 0,
        scale: 1.5,
    })

    expect(calcDelta(cBefore, cAfter)).toEqual({
        translate: -1,
        origin: 0.5,
        originPoint: 400,
        scale: 2,
    })
})
