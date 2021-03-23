import { FlatTree } from "../flat-tree"

describe("FlatTree", () => {
    test("Correctly sorts by depth on iteration", () => {
        const tree = new FlatTree()
        tree.add({ depth: 1 })
        tree.add({ depth: 0 })
        expect(tree.children).toBe([{ depth: 1 }, { depth: 0 }])

        tree.forEach(() => {})
        expect(tree.children).toBe([{ depth: 0 }, { depth: 1 }])
    })
})
