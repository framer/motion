export interface WithDepth {
    depth: number
}

export const compareByDepth = (a: WithDepth, b: WithDepth) => a.depth - b.depth
