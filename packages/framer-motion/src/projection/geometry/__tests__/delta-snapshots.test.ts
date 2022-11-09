import { Snapshot } from "../../node/types"
import { createTestNode } from "../../node/__tests__/TestProjectionNode"
import { calcSnapshotDelta } from "../delta-snapshots"
import { createBox } from "../models"

const defaultProjectionNode = createTestNode()

function testSnapshot(snapshot: Partial<Snapshot>): Snapshot {
    return {
        frameTimestamp: 0,
        viewportBox: createBox(),
        layoutBox: createBox(),
        values: {},
        position: "static",
        origin: defaultProjectionNode,
        ...snapshot,
    }
}

describe("calcSnapshotDelta: single child", () => {
    test("static => static: no change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
        })
    })

    test("static => static: page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        // Simulates a y scroll of 50 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -50, max: 50 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
        })
    })

    test("static => static: layout change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        // Simulates a layout shift of 100x100
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
            y: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("static => static: layout change with page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        // Simulates a y scroll of 50 pixels and layout shift of 100x100
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 50, max: 150 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
            y: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("static => static: element scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
        })

        // Simulates an element scroll of 100
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("static => fixed: no change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            position: "static",
        })

        // Simulates an element scroll of 100
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("static => fixed: page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "static",
        })

        // Simulates a page scroll of y: 100
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 100, max: 200 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("static => sticky: no change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "static",
        })

        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "sticky",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })

    test("static => sticky: page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        // Simulates a y scroll of 50 pixels and the element is stuck
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 500 },
                y: { min: 0, max: 500 },
            },
            layoutBox: {
                x: { min: 0, max: 500 },
                y: { min: 50, max: 500 },
            },
            position: "sticky",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })

    test("fixed => fixed: page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "fixed",
        })

        // Simulates a y scroll of 50 pixels and the element is stuck
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 50, max: 100 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
        })
    })

    test("fixed => fixed: layout change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "fixed",
        })

        // Simulates a y scroll of 50 pixels and the element is stuck
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 100, max: 200 },
                y: { min: 100, max: 200 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
            y: {
                translate: -100,
                scale: 1,
                origin: 0.5,
                originPoint: 150,
            },
        })
    })

    test("fixed => fixed: page scroll and layout change", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 100, max: 200 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 100, max: 200 },
            },
            position: "fixed",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 1000, max: 1100 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
        })
    })

    test("fixed => static: page scroll", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "fixed",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            position: "static",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0.5,
                originPoint: 50,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0.5,
                originPoint: -50,
            },
        })
    })

    test("fixed => sticky", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "fixed",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            position: "sticky",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })

    test("sticky => sticky", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "sticky",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            position: "sticky",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })

    test("sticky => static", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "sticky",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            position: "static",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })

    test("sticky => fixed", () => {
        const before: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
            position: "sticky",
        })

        // Simulates a y scroll of 100 pixels
        const after: Snapshot = testSnapshot({
            viewportBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            layoutBox: {
                x: { min: 0, max: 100 },
                y: { min: -100, max: 0 },
            },
            position: "fixed",
        })

        expect(calcSnapshotDelta(before, after)).toEqual({
            x: {
                translate: 0,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
            y: {
                translate: 100,
                scale: 1,
                origin: 0,
                originPoint: 0,
            },
        })
    })
})
