import { Stack, StackChild, findLeadAndFollow, LeadAndFollow } from "../stack"

let id = 0

function makeChild(isPresent = true) {
    id++
    return { id, isPresent: () => isPresent }
}

function testFindLead<T extends StackChild>(
    stack: T[],
    previous: Array<T | undefined>,
    expected: Array<T | undefined>
) {
    const [lead, prev] = findLeadAndFollow(stack, previous as LeadAndFollow<T>)
    expect(lead).toBe(expected[0])
    expect(prev).toBe(expected[1])
}

describe("findLeadAndFollow", () => {
    test("[] -> [a]", () => {
        const a = makeChild(true)
        testFindLead([a], [], [a])
    })

    test("[a] -> [a]", () => {
        const a = makeChild(true)
        testFindLead([a], [a], [a])
    })

    test("[a] -> [a(e)]", () => {
        const a = makeChild(false)
        testFindLead([a], [a], [a])
    })

    test("[a] -> [a, b]", () => {
        const a = makeChild(true)
        const b = makeChild(true)
        testFindLead([a, b], [a], [b, a])
    })

    test("[a] -> [a(e), b]", () => {
        const a = makeChild(false)
        const b = makeChild(true)
        testFindLead([a, b], [a], [b, a])
    })

    test("[a, b] -> [a, b(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        testFindLead([a, b], [b, a], [b, a])
    })

    test("[a, b] -> [a]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        testFindLead([a], [b, a], [a])
    })

    test("[a, b] -> [a, b, c]", () => {
        const a = makeChild(true)
        const b = makeChild(true)
        const c = makeChild(true)
        testFindLead([a, b, c], [b, a], [c, b])
    })

    test("[a, b, c] -> [a, b, c]", () => {
        const a = makeChild(true)
        const b = makeChild(true)
        const c = makeChild(true)
        testFindLead([a, b, c], [c, b], [c, b])
    })

    test("[a, b, c] -> [a, b, c(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(true)
        const c = makeChild(false)
        testFindLead([a, b, c], [b, a], [c, b])
    })

    test("[a, b, c(e)] -> [a, b, c(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(true)
        const c = makeChild(false)
        testFindLead([a, b, c], [c, b], [c, b])
    })

    test("[a, b, c(e)] -> [a, b(e), c(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(false)
        testFindLead([a, b, c], [c, b], [b, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(false)
        testFindLead([a, b, c], [b, a], [b, a])
    })

    test("[a, b(e)] -> [a, b(e), c]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(true)
        testFindLead([a, b, c], [b, a], [c, a])
    })

    test(" [a, b(e), c]-> [a, b(e), c]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(true)
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c] -> [a, b(e), c(e)]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(false)
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e)] (c as lead)", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(false)
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e) (b as lead)]", () => {
        const a = makeChild(true)
        const b = makeChild(false)
        const c = makeChild(false)
        testFindLead([a, b, c], [b, a], [b, a])
    })
})

describe("Stack", () => {
    test("It correctly adds and removes children", () => {
        const stack = new Stack()
        const a = makeChild(true)
        stack.add(a)
        expect(stack.order).toEqual([a])
        const b = makeChild(true)
        const c = makeChild(true)
        stack.add(b)
        stack.add(c)
        expect(stack.order).toEqual([a, b, c])
        stack.remove(b)
        expect(stack.order).toEqual([a, c])
    })

    test("It correctly updates lead and follow", () => {
        const stack = new Stack()
        const a = makeChild(true)
        const b = makeChild(true)
        const c = makeChild(true)
        stack.add(a)
        stack.add(b)
        stack.add(c)
        stack.updateLeadAndFollow()
        expect(stack.lead).toBe(c)
        expect(stack.follow).toBe(b)
    })

    test("It correctly updates snapshot", () => {
        const stack = new Stack()
        const a = makeChild(true)
        ;(a as any).measuredOrigin = "snapshot"
        stack.add(a)
        stack.updateLeadAndFollow()
        stack.updateSnapshot()
        expect(stack.snapshot).toBe("snapshot")
    })
})
