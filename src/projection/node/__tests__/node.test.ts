import { createTestNode } from "./TestProjectionNode"

describe("node", () => {
    test("If a child updates layout, and parent has scale, parent resetsTransform during measurement", () => {
        const parent = createTestNode(undefined, {}, { scale: 2 })

        const parentInstance = {
            id: "parent",
            resetTransform: jest.fn(),
            box: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        }
        parent.mount(parentInstance)
        parent.addEventListener("didUpdate", ({ delta }: any) =>
            parent.setTargetDelta(delta)
        )

        const child = createTestNode(parent)
        const childInstance = {
            id: "child",
            resetTransform: jest.fn(),
            box: {
                x: { min: 0, max: 50 },
                y: { min: 0, max: 50 },
            },
        }
        child.mount(childInstance)
        child.addEventListener("didUpdate", ({ delta }: any) => {
            child.setTargetDelta(delta)
        })

        parent.willUpdate()
        child.willUpdate()

        parentInstance.box = {
            x: { min: 100, max: 200 },
            y: { min: 100, max: 200 },
        }

        childInstance.box = {
            x: { min: 150, max: 200 },
            y: { min: 150, max: 200 },
        }

        child.root.didUpdate()

        expect(parentInstance.resetTransform).toBeCalledTimes(1)
        expect(childInstance.resetTransform).toBeCalledTimes(0)

        child.willUpdate()

        childInstance.box = {
            x: { min: 0, max: 150 },
            y: { min: 0, max: 150 },
        }

        child.root.didUpdate()

        expect(parentInstance.resetTransform).toBeCalledTimes(2)
        expect(childInstance.resetTransform).toBeCalledTimes(0)
    })

    test("If a child updates layout, parent doesn't resetsTransform during measurement if it has no projection transform", () => {
        const parent = createTestNode()

        const parentInstance = {
            id: "parent",
            resetTransform: jest.fn(),
            box: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        }
        parent.mount(parentInstance)
        parent.addEventListener("didUpdate", ({ delta }: any) =>
            parent.setTargetDelta(delta)
        )

        const child = createTestNode(parent)
        const childInstance = {
            id: "child",
            resetTransform: jest.fn(),
            box: {
                x: { min: 0, max: 50 },
                y: { min: 0, max: 50 },
            },
        }
        child.mount(childInstance)
        child.addEventListener("didUpdate", ({ delta }: any) => {
            child.setTargetDelta(delta)
        })

        parent.willUpdate()
        child.willUpdate()

        childInstance.box = {
            x: { min: 150, max: 200 },
            y: { min: 150, max: 200 },
        }

        child.root.didUpdate()

        // Shouldn't call on initial render as calculated deltas are zero
        expect(parentInstance.resetTransform).toBeCalledTimes(0)
        expect(childInstance.resetTransform).toBeCalledTimes(0)

        child.willUpdate()

        child.projectionDelta = {
            x: { translate: 100, scale: 1, originPoint: 60, origin: 0.4 },
            y: { translate: 0, scale: 1, originPoint: 60, origin: 0.4 },
        }

        childInstance.box = {
            x: { min: 0, max: 150 },
            y: { min: 0, max: 150 },
        }

        child.root.didUpdate()

        expect(parentInstance.resetTransform).toBeCalledTimes(0)
        expect(childInstance.resetTransform).toBeCalledTimes(1)
    })
})
