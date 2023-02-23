import { Edge, NamedEdges } from "../types"

export const namedEdges: Record<NamedEdges, number> = {
    start: 0,
    center: 0.5,
    end: 1,
}

export function resolveEdge(edge: Edge, length: number, inset = 0) {
    let delta = 0

    /**
     * If we have this edge defined as a preset, replace the definition
     * with the numerical value.
     */
    if (namedEdges[edge] !== undefined) {
        edge = namedEdges[edge]
    }

    /**
     * Handle unit values
     */
    if (typeof edge === "string") {
        const asNumber = parseFloat(edge)

        if (edge.endsWith("px")) {
            delta = asNumber
        } else if (edge.endsWith("%")) {
            edge = asNumber / 100
        } else if (edge.endsWith("vw")) {
            delta = (asNumber / 100) * document.documentElement.clientWidth
        } else if (edge.endsWith("vh")) {
            delta = (asNumber / 100) * document.documentElement.clientHeight
        } else {
            edge = asNumber
        }
    }

    /**
     * If the edge is defined as a number, handle as a progress value.
     */
    if (typeof edge === "number") {
        delta = length * edge
    }

    return inset + delta
}
