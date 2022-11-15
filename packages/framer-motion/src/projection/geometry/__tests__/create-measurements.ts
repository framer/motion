import { Measurements } from "../../node/types"

export function createMeasurements(
    measurements: Partial<Measurements>
): Measurements {
    return {
        animationId: 0,
        source: 0,
        viewportBox: {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 100 },
        },
        layoutBox: {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 100 },
        },
        treeScroll: { x: 0, y: 0 },
        latestValues: {},
        position: "static",
        ...measurements,
    }
}
