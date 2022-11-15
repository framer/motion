import { Measurements } from "../../node/types"
import { resizeSnapshot } from "../delta-snapshot"
import { createMeasurements } from "./create-measurements"

describe("resizeSnapshot", () => {
    test("reposition snapshot to match measurement if type=size (scroll change only)", () => {
        const snapshot: Measurements = createMeasurements({})

        const layout: Measurements = createMeasurements({
            viewportBox: {
                x: { min: 0, max: 200 },
                y: { min: 0, max: 200 },
            },
            layoutBox: {
                x: { min: 0, max: 200 },
                y: { min: 0, max: 200 },
            },
            treeScroll: { x: 0, y: 100 },
        })

        resizeSnapshot(snapshot, layout, "size", false)

        expect(snapshot.treeScroll).toEqual({ x: 0, y: 100 })
        expect(snapshot.layoutBox).toEqual({
            x: { min: 0, max: 100 },
            y: { min: 0, max: 100 },
        })
    })

    test("reposition snapshot to match measurement if type=size (layout change only)", () => {
        const snapshot: Measurements = createMeasurements({})

        const layout: Measurements = createMeasurements({
            viewportBox: {
                x: { min: 100, max: 300 },
                y: { min: 100, max: 300 },
            },
            layoutBox: {
                x: { min: 100, max: 300 },
                y: { min: 100, max: 300 },
            },
            treeScroll: { x: 0, y: 0 },
        })

        resizeSnapshot(snapshot, layout, "size", false)

        expect(snapshot.treeScroll).toEqual({ x: 0, y: 0 })
        expect(snapshot.layoutBox).toEqual({
            x: { min: 100, max: 200 },
            y: { min: 100, max: 200 },
        })
    })

    test("resize snapshot to match measurement if animating position only (scroll change only)", () => {
        const snapshot: Measurements = createMeasurements({})

        const layout: Measurements = createMeasurements({
            viewportBox: {
                x: { min: 100, max: 400 },
                y: { min: 100, max: 300 },
            },
            layoutBox: {
                x: { min: 100, max: 400 },
                y: { min: 100, max: 300 },
            },
            treeScroll: { x: 0, y: 100 },
        })

        resizeSnapshot(snapshot, layout, "position", false)

        expect(snapshot.treeScroll).toEqual({ x: 0, y: 0 })
        expect(snapshot.layoutBox).toEqual({
            x: { min: 0, max: 300 },
            y: { min: 0, max: 200 },
        })
    })
})
