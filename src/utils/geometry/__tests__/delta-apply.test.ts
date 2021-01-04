import {
    resetAxis,
    resetBox,
    scalePoint,
    applyPointDelta,
    applyAxisDelta,
    applyAxisTransforms,
    applyBoxTransforms,
    removePointDelta,
    removeAxisDelta,
    removeAxisTransforms,
    removeBoxTransforms,
    applyTreeDeltas,
} from "../delta-apply"
import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement"

describe("resetAxis", () => {
    test("resets axis a using the values in axis b", () => {
        const a = { min: 0, max: 0 }
        const b = { min: 1, max: 2 }
        resetAxis(a, b)
        expect(a).toEqual(b)
    })
})

describe("resetBox", () => {
    test("reset box a using the values in axis b", () => {
        const a = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }
        const b = {
            x: { min: 1, max: 2 },
            y: { min: 3, max: 4 },
        }
        resetBox(a, b)
        expect(a).toEqual(b)
    })
})

describe("scalePoint", () => {
    test("correctly scales a point based on a factor and an originPoint", () => {
        expect(scalePoint(100, 2, 50)).toBe(150)
        expect(scalePoint(100, 0.5, 50)).toBe(75)
        expect(scalePoint(100, 2, 150)).toBe(50)
        expect(scalePoint(100, 0.5, 150)).toBe(125)
    })
})

describe("applyPointDelta", () => {
    test("correctly applies a delta to a point", () => {
        expect(applyPointDelta(100, 100, 2, 50)).toBe(250)
        expect(applyPointDelta(100, 100, 2, 150)).toBe(150)
    })

    test("correctly applies a delta to a point with an additional boxScale", () => {
        expect(applyPointDelta(100, 100, 2, 50, 2)).toBe(350)
        expect(applyPointDelta(100, 100, 2, 150, 2)).toBe(50)
    })
})

describe("applyAxisDelta", () => {
    test("correctly applies a delta to an axis", () => {
        const axis = { min: 100, max: 200 }
        applyAxisDelta(axis, 100, 2, 150)
        expect(axis).toEqual({ min: 150, max: 350 })
    })

    test("correctly applies a delta to an axis with an additional boxScale", () => {
        const axis = { min: 100, max: 200 }
        applyAxisDelta(axis, 100, 2, 150, 2)
        expect(axis).toEqual({ min: 50, max: 450 })
    })
})

describe("applyAxisTransforms", () => {
    test("correctly applies transforms to an axis", () => {
        const target = { min: 0, max: 0 }
        const axis = { min: 100, max: 200 }
        applyAxisTransforms(
            target,
            axis,
            {
                x: 100,
                scaleX: 2,
                originX: -0.5,
            },
            ["x", "scaleX", "originX"]
        )
        expect(target).toEqual({ min: 250, max: 450 })
    })

    test("correctly applies transforms with missing scale", () => {
        const target = { min: 0, max: 0 }
        const axis = { min: 100, max: 200 }
        applyAxisTransforms(target, axis, { x: 100, originX: -0.5 }, [
            "x",
            "scaleX",
            "originX",
        ])
        expect(target).toEqual({ min: 200, max: 300 })
    })
})

describe("applyBoxTransform", () => {
    test("correctly applies a transform to a box", () => {
        const target = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }

        const box = {
            x: { min: 100, max: 200 },
            y: { min: 300, max: 400 },
        }

        applyBoxTransforms(target, box, {
            x: 100,
            y: 200,
            scaleX: 2,
            scaleY: 0.5,
            scale: 2,
        })

        expect(target).toEqual({
            x: { min: 50, max: 450 },
            y: { min: 500, max: 600 },
        })
    })
})

describe("removePointDelta", () => {
    test("correctly removes a delta from a point", () => {
        expect(removePointDelta(250, 100, 2, 50)).toBe(100)
    })
    test("correctly removes a delta from a point with an additional boxScale", () => {
        expect(removePointDelta(350, 100, 2, 50, 2)).toBe(100)
    })
})

describe("removeAxisDelta", () => {
    test("correctly removes a delta from an axis", () => {
        const axis = { min: 150, max: 350 }
        removeAxisDelta(axis, 100, 2, 0.5)
        expect(axis).toEqual({ min: 100, max: 200 })
    })

    test("correctly removes a delta from an axis with an additional boxScale", () => {
        const axis = { min: 50, max: 450 }
        removeAxisDelta(axis, 100, 2, 0.5, 2)
        expect(axis).toEqual({ min: 100, max: 200 })
    })
})

describe("removeAxisTransforms", () => {
    test("correctly removes transforms from an axis", () => {
        const axis = { min: 250, max: 450 }
        removeAxisTransforms(
            axis,
            {
                x: 100,
                scaleX: 2,
                originX: -0.5,
            },
            ["x", "scaleX", "originX"]
        )
        expect(axis).toEqual({ min: 100, max: 200 })
    })
})

describe("removeBoxTransforms", () => {
    const box = {
        x: { min: 50, max: 450 },
        y: { min: 500, max: 600 },
    }

    removeBoxTransforms(box, {
        x: 100,
        y: 200,
        scaleX: 2,
        scaleY: 0.5,
        scale: 2,
    })

    expect(box).toEqual({
        x: { min: 100, max: 200 },
        y: { min: 300, max: 400 },
    })
})

describe("applyTreeDeltas", () => {
    test("correctly applies tree deltas to a box", () => {
        const box = {
            x: { min: 100, max: 200 },
            y: { min: 300, max: 400 },
        }

        const delta = {
            x: { translate: 100, scale: 4, origin: 0.5, originPoint: 150 },
            y: { translate: -100, scale: 0.5, origin: 0.5, originPoint: 350 },
        }

        const element = new HTMLVisualElement()
        element.delta = delta

        const treeScale = { x: 1, y: 1 }
        applyTreeDeltas(box, treeScale, [element, element])

        expect(box).toEqual({
            x: { min: -150, max: 1450 },
            y: { min: 187.5, max: 212.5 },
        })
        expect(treeScale).toEqual({ x: 16, y: 0.25 })
    })
})
