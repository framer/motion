import { calculateConstraints } from "../ComponentDragControls"

describe("calculateConstraints", () => {
    test("Correctly calculate constraints when container is larger than draggable element", () => {
        const container = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 500 },
        }

        const draggable = {
            x: { min: 0, max: 200 },
            y: { min: 0, max: 100 },
        }

        expect(calculateConstraints(container, draggable)).toEqual({
            x: { min: 0, max: 200 },
            y: { min: 0, max: 400 },
        })
    })
    test("Correctly calculate constraints when container is larger than draggable element and draggable element is out of bounds to the top left", () => {
        const container = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 400 },
        }

        const draggable = {
            x: { min: -100, max: 0 },
            y: { min: -100, max: 0 },
        }

        expect(calculateConstraints(container, draggable)).toEqual({
            x: { min: 100, max: 400 },
            y: { min: 100, max: 400 },
        })
    })

    test("Correctly calculate constraints when container is larger than draggable element and draggable element is out of bounds to the bottom right", () => {
        const container = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 400 },
        }

        const draggable = {
            x: { min: 500, max: 600 },
            y: { min: 500, max: 600 },
        }

        expect(calculateConstraints(container, draggable)).toEqual({
            x: { min: -500, max: -200 },
            y: { min: -500, max: -200 },
        })
    })

    test("Correctly calculate constraints when ref is the same size as the element", () => {
        const container = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 400 },
        }

        const draggable = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 400 },
        }

        expect(calculateConstraints(container, draggable)).toEqual({
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        })
    })

    test("Correctly calculate constraints when container is smaller than draggable element", () => {
        const container = {
            x: { min: 0, max: 200 },
            y: { min: 0, max: 200 },
        }

        const draggable = {
            x: { min: 0, max: 400 },
            y: { min: 0, max: 400 },
        }

        expect(calculateConstraints(container, draggable)).toEqual({
            x: { min: -200, max: 0 },
            y: { min: -200, max: 0 },
        })
    })
})
