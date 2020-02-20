interface Axis {
    min: number
    max: number
}

interface Delta {
    translate: number
    scale: number
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

function calcOrigin(before: Axis, after: Axis): number {
    let origin = 0.5
    const minDelta = before.min - after.min
    const maxDelta = before.max - after.max

    // Hasn't changed size, just return center point
    if (minDelta === maxDelta) return origin

    return origin
}

function calcDelta(before: Axis, after: Axis): Delta {
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    const scale = beforeSize / afterSize
    const origin = calcOrigin(before, after)

    return {
        scale,
        translate: -1,
        originPoint: 100,
    }
}

function scaledPoint({ scale, originPoint }: Delta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

function applyDelta(delta: Delta, axis: Axis) {
    let min = axis.min
    let max = axis.max

    min = scaledPoint(delta, axis.min)
    max = scaledPoint(delta, axis.max)

    return { min, max }
}

test("scaledPoint", () => {
    expect(
        scaledPoint({ scale: 2, originPoint: 0, translate: 0 }, 100)
    ).toEqual(200)
    expect(
        scaledPoint({ scale: 0.5, originPoint: 0, translate: 0 }, 100)
    ).toEqual(50)
    expect(
        scaledPoint({ scale: 3, originPoint: 500, translate: 0 }, 100)
    ).toEqual(-700)
})

test("transforms", () => {
    const aDelta = calcDelta(aBefore, aAfter)

    expect(aDelta).toEqual({
        translate: -1,
        origin: 0.5,
        originPoint: 100,
        scale: 1.5,
    })

    expect(applyDelta(aDelta, aAfter)).toEqual(aBefore)
})
