import { scalePoint, applyPointDelta, applyAxisDelta } from "../delta-apply"
import { Axis, AxisDelta } from "../types"

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

describe.only("Culmultive tree deltas", () => {
    test("treeScale", () => {
        // Emulate a tree of scales
        const scales = [0.5, 1, 1.5, 6, 0.1]

        // Emulate current approach of ancestor loop
        const integratedScales: number[] = []
        for (let i = 0; i < scales.length; i++) {
            let treeScale = 1
            for (let j = 0; j < i; j++) {
                treeScale *= scales[j]
            }
            integratedScales.push(treeScale)
        }

        // Proof of concept of cumulative approach
        const rootScale = 1
        const cumulativeScales: number[] = [rootScale]
        for (let i = 0; i < scales.length - 1; i++) {
            cumulativeScales.push(cumulativeScales[i] * scales[i])
        }

        expect(integratedScales).toEqual(cumulativeScales)
    })

    interface TestDelta {
        delta: AxisDelta
        axis: Axis
    }

    // This proves we can't do a cumulative transform
    test.skip("boxDelta", () => {
        const nodes: TestDelta[] = [
            {
                axis: { min: 0, max: 100 },
                delta: {
                    translate: 100,
                    scale: 0.5,
                    origin: 1,
                    originPoint: 100,
                },
            },
            {
                axis: { min: 0, max: 100 },
                delta: {
                    translate: -100,
                    scale: 3,
                    origin: 0.5,
                    originPoint: 50,
                },
            },
            {
                axis: { min: 0, max: 100 },
                delta: {
                    translate: -500,
                    scale: 1,
                    origin: 0.5,
                    originPoint: 50,
                },
            },
            {
                axis: { min: 500, max: 600 },
                delta: {
                    translate: 400,
                    scale: 2,
                    origin: 0,
                    originPoint: 500,
                },
            },
            {
                axis: { min: -100, max: 100 },
                delta: {
                    translate: 100,
                    scale: 0.5,
                    origin: 0.5,
                    originPoint: 0,
                },
            },
        ]

        // Emulate current approach of ancestor loop
        const integratedAxes: Axis[] = []
        for (let i = 0; i < nodes.length; i++) {
            const axis = { ...nodes[i].axis }
            let delta: undefined | AxisDelta = undefined
            for (let j = 0; j < i; j++) {
                delta = nodes[j].delta
                console.log("applying", delta, "to", axis)
                applyAxisDelta(
                    axis,
                    delta.translate,
                    delta.scale,
                    delta.originPoint
                )
            }
            console.log("integrated last origin", delta?.originPoint)
            integratedAxes.push(axis)
        }

        // Proof of concept of cumulative approach
        const cumulativeDeltas: AxisDelta[] = [
            { translate: 0, scale: 1, originPoint: 0, origin: 0 },
        ]
        const cumulativeAxes: Axis[] = []
        for (let i = 0; i < nodes.length; i++) {
            const parentDelta = cumulativeDeltas[i]

            const axis = { ...nodes[i].axis }
            console.log("applying", parentDelta, "to", axis)
            applyAxisDelta(
                axis,
                parentDelta.translate,
                parentDelta.scale,
                parentDelta.originPoint
            )

            cumulativeAxes.push(axis)

            const delta = { ...nodes[i].delta }

            // Apply parent delta to current delta
            // Currently works for translate but not scale
            delta.translate += parentDelta.translate
            delta.scale *= parentDelta.scale
            delta.originPoint += delta.translate

            cumulativeDeltas.push(delta)
        }

        console.log(integratedAxes, cumulativeAxes)

        expect(integratedAxes).toEqual(cumulativeAxes)
    })
})
