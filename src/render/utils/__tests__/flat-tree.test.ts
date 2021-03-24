import { WithDepth } from "../compare-by-depth"
import { FlatTree } from "../flat-tree"

describe("FlatTree", () => {
    test("Correctly sorts by depth on iteration", () => {
        const tree = new FlatTree()

        tree.add({ depth: 1 })
        tree.add({ depth: 0 })
        expect((tree as any).children).toStrictEqual([
            { depth: 1 },
            { depth: 0 },
        ])

        const received: WithDepth[] = []
        tree.forEach((child) => received.push(child))
        expect(received).toStrictEqual([{ depth: 0 }, { depth: 1 }])
        expect((tree as any).children).toStrictEqual([
            { depth: 0 },
            { depth: 1 },
        ])
    })
})
