import { Axis } from "../types"
import {
    scaledPoint,
    calcOrigin,
    calcTranslate,
    calcDelta,
    applyDelta,
    applyTreeDeltas,
    calcBoxDelta,
    applyBoxDelta,
} from "../utils"

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

test("applyTreeDeltas", () => {
    const outerBefore = { x: { min: 0, max: 300 }, y: { min: 0, max: 300 } }
    const innerBefore = { x: { min: 100, max: 200 }, y: { min: 100, max: 200 } }
    const outerAfter = {
        x: { min: 400, max: 1000 },
        y: { min: 400, max: 1000 },
    }
    const innerAfter = { x: { min: 650, max: 750 }, y: { min: 650, max: 750 } }

    const outerDelta = calcBoxDelta(outerBefore, outerAfter)

    expect(applyBoxDelta(outerDelta, outerAfter)).toEqual(outerBefore)

    const innerAfterNested = applyBoxDelta(outerDelta, innerAfter)
    const innerNestedDelta = calcBoxDelta(innerBefore, innerAfterNested)
    expect(applyBoxDelta(innerNestedDelta, innerAfterNested)).toEqual(
        innerBefore
    )

    const treeBefore = { x: { min: 50, max: 100 }, y: { min: 50, max: 100 } }
    const treeAfter = { x: { min: 100, max: 200 }, y: { min: 100, max: 200 } }

    const treeNested = applyTreeDeltas(
        [outerDelta, innerNestedDelta],
        treeAfter
    )
    const treeNestedDelta = calcBoxDelta(treeBefore, treeNested)

    expect(applyBoxDelta(treeNestedDelta, treeNested)).toEqual(treeBefore)
})
