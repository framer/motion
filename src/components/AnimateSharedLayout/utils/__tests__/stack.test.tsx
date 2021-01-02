import { LayoutStack, findLeadAndFollow, LeadAndFollow } from "../stack"
import { makeChild } from "./utils"
import { Presence } from "../../types"
import { HTMLVisualElement } from "../../../../render/dom/HTMLVisualElement"

function testFindLead(
    stack: HTMLVisualElement[],
    previous: Array<HTMLVisualElement | undefined>,
    expected: Array<HTMLVisualElement | undefined>
) {
    const [lead, prev] = findLeadAndFollow(stack, previous as LeadAndFollow)
    expect(lead).toBe(expected[0])
    expect(prev).toBe(expected[1])
}

describe("findLeadAndFollow", () => {
    test("[] -> [a]", () => {
        const a = makeChild()
        testFindLead([a], [], [a])
    })

    test("[a] -> [a]", () => {
        const a = makeChild()
        testFindLead([a], [a], [a])
    })

    test("[a] -> [a(e)]", () => {
        const a = makeChild(Presence.Exiting)
        testFindLead([a], [a], [a])
    })

    test("[a] -> [a, b]", () => {
        const a = makeChild()
        const b = makeChild()
        testFindLead([a, b], [a], [b, a])
    })

    test("[a] -> [a(e), b]", () => {
        const a = makeChild(Presence.Exiting)
        const b = makeChild()
        testFindLead([a, b], [a], [b, a])
    })

    test("[a, b] -> [a, b(e)]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        testFindLead([a, b], [b, a], [b, a])
    })

    test("[a, b] -> [a]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        testFindLead([a], [b, a], [a])
    })

    test("[a, b] -> [a, b, c]", () => {
        const a = makeChild()
        const b = makeChild()
        const c = makeChild()
        testFindLead([a, b, c], [b, a], [c, b])
    })

    test("[a, b, c] -> [a, b, c]", () => {
        const a = makeChild()
        const b = makeChild()
        const c = makeChild()
        testFindLead([a, b, c], [c, b], [c, b])
    })

    test("[a, b, c] -> [a, b, c(e)]", () => {
        const a = makeChild()
        const b = makeChild()
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [b, a], [c, b])
    })

    test("[a, b, c(e)] -> [a, b, c(e)]", () => {
        const a = makeChild()
        const b = makeChild()
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [c, b], [c, b])
    })

    test("[a, b, c(e)] -> [a, b(e), c(e)]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [c, b], [b, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e)]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [b, a], [b, a])
    })

    test("[a, b(e)] -> [a, b(e), c]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild()
        testFindLead([a, b, c], [b, a], [c, a])
    })

    test(" [a, b(e), c]-> [a, b(e), c]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild()
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c] -> [a, b(e), c(e)]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e)] (c as lead)", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [c, a], [c, a])
    })

    test("[a, b(e), c(e)] -> [a, b(e), c(e) (b as lead)]", () => {
        const a = makeChild()
        const b = makeChild(Presence.Exiting)
        const c = makeChild(Presence.Exiting)
        testFindLead([a, b, c], [b, a], [b, a])
    })
})

describe("Stack", () => {
    test("It correctly adds and removes children", () => {
        const stack = new LayoutStack()
        const a = makeChild()
        stack.add(a)
        expect(stack.order).toEqual([a])
        const b = makeChild()
        const c = makeChild()
        stack.add(b)
        stack.add(c)
        expect(stack.order).toEqual([a, b, c])
        stack.remove(b)
        expect(stack.order).toEqual([a, c])
    })

    test("It correctly updates lead and follow", () => {
        const stack = new LayoutStack()
        const a = makeChild()
        const b = makeChild()
        const c = makeChild()
        stack.add(a)
        stack.add(b)
        stack.add(c)
        stack.updateLeadAndFollow()
        expect(stack.lead).toBe(c)
        expect(stack.follow).toBe(b)
    })

    test("It correctly updates snapshot", () => {
        const stack = new LayoutStack()
        const a = makeChild()
        ;(a as any).prevViewportBox = "a"
        stack.add(a)
        stack.updateLeadAndFollow()
        stack.updateSnapshot()
        expect(stack.snapshot).toStrictEqual({
            boundingBox: "a",
            latestMotionValues: { opacity: 0 },
        })
    })
})
