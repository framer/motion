import { createSwitchAnimation, createCrossfadeAnimation } from "../animations"
import { LayoutStack } from "../stack"
import { Presence, VisibilityAction } from "../types" //, StackPosition, VisibilityAction } from "../types"
import { makeChild } from "./utils"
import { motionValue } from "../../../value"

function update(stack: LayoutStack) {
    stack.updateLeadAndFollow()
    stack.updateSnapshot()
}

describe("createSwitchAnimation", () => {
    test("[A1] -> [A2]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.remove(a)
        stack.add(b)
        stack.updateLeadAndFollow()

        expect(createSwitchAnimation(b, true, stack)).toEqual({
            originBox: "aOrigin",
        })
    })

    test("[A1] -> [A1]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        stack.add(a)
        update(stack)
        update(stack)

        expect(createSwitchAnimation(a, true, stack)).toEqual({})
    })

    test("[A1] -> [A1, A2]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)

        // Normal animate component
        const normal = makeChild(
            Presence.Present,
            "normalOrigin",
            "normalTarget"
        )
        expect(createSwitchAnimation(normal, false)).toEqual({})

        // A1
        expect(createSwitchAnimation(a, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })

        // A2
        expect(createSwitchAnimation(b, true, stack)).toEqual({
            originBox: "aOrigin",
        })
    })

    test("[A1, A2] -> [A1, A2 (exiting)]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        stack.add(a)
        stack.add(b)
        update(stack)
        update(stack)

        // A1
        expect(createSwitchAnimation(a, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })

        // A2
        expect(createSwitchAnimation(b, true, stack)).toEqual({
            targetBox: "aTarget",
        })
    })

    test("[A1, A2 (entering)] -> [A1, A2 (exiting)]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        stack.updateLeadAndFollow()
        stack.add(b)
        stack.updateLeadAndFollow()

        // A1
        expect(createSwitchAnimation(a, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })

        // A2
        expect(createSwitchAnimation(b, true, stack)).toEqual({
            originBox: "aOrigin",
        })

        b.presence = Presence.Exiting
        stack.updateLeadAndFollow()

        // A1
        expect(createSwitchAnimation(a, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })

        // A2
        expect(createSwitchAnimation(b, true, stack)).toEqual({
            targetBox: "aTarget",
        })
        stack.remove(b)
        stack.updateLeadAndFollow()

        expect(createSwitchAnimation(a, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Show,
        })
    })

    test("[A1, A2 (exiting)] -> [A1]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        stack.add(a)
        stack.add(b)
        update(stack)
        stack.remove(b)
        update(stack)

        // A1
        expect(createSwitchAnimation(a, true, stack as any)).toEqual({
            visibilityAction: VisibilityAction.Show,
        })
    })
})

describe("createCrossfadeAnimation", () => {
    test("Switching root components: [A1] -> [A1 (exiting), A2]", () => {
        const stack = new LayoutStack()
        const aOpacity = motionValue(0)
        const a = makeChild(Presence.Exiting, "aOrigin", "aTarget", aOpacity)
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({
            targetBox: "bTarget",
        })

        // A2
        expect(createCrossfadeAnimation(b, true, stack)).toEqual({
            originBox: "aOrigin",
            crossfadeOpacity: aOpacity,
        })
    })

    test("Switching root components: [A1] -> [A1 (exiting), A2]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Exiting, "aOrigin", "aTarget")
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, false, stack)).toEqual({
            targetBox: "bTarget",
        })

        // A2
        expect(createCrossfadeAnimation(b, false, stack)).toEqual({
            originBox: "aOrigin",
        })
    })

    test("[A1, A2 (exiting)] -> [A1]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)
        stack.remove(b)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack as any)).toEqual({})
    })

    test("Interrupting switch animation: [A1 (exiting), A2] -interrupted-> [A1, A2 (exiting)]", () => {
        const stack = new LayoutStack()
        const aOpacity = motionValue(0)
        const a = makeChild(Presence.Present, "aOrigin", "aTarget", aOpacity)
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        stack.add(a)
        stack.add(b)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({
            originBox: "bOrigin",
            crossfadeOpacity: aOpacity,
            transition: undefined,
        })

        // A2
        expect(createCrossfadeAnimation(b, true, stack)).toEqual({
            targetBox: "aTarget",
        })
    })

    test("Adding: [A1] -> [A1, A2]", () => {
        const stack = new LayoutStack()
        const aOpacity = motionValue(0)
        const a = makeChild(Presence.Present, "aOrigin", "aTarget", aOpacity)
        const b = makeChild(Presence.Entering, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({
            targetBox: "bTarget",
        })

        // A2
        expect(createCrossfadeAnimation(b, true, stack)).toEqual({
            originBox: "aOrigin",
            crossfadeOpacity: aOpacity,
        })
    })

    test("Removing: [A1, A2] -> [A1]", () => {
        const stack = new LayoutStack()
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)
        stack.remove(b)
        update(stack)
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({})
    })

    test("Interrupting remove with new component: [A1, A2 (exiting)] -interrupted-> [A1, A2 (exiting), A3]", () => {
        const stack = new LayoutStack()
        const aOpacity = motionValue(0)
        const a = makeChild(Presence.Present, "aOrigin", "aTarget", aOpacity)
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
        const c = makeChild(Presence.Entering, "cOrigin", "cTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)
        stack.add(c)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({
            targetBox: "cTarget",
        })

        // A2
        expect(createCrossfadeAnimation(b, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })

        // A3
        expect(createCrossfadeAnimation(c, true, stack)).toEqual({
            originBox: "aOrigin",
            crossfadeOpacity: aOpacity,
        })
    })

    test("Interrupting remove by removing: [A1, A2, A3 (exiting)] -interrupted-> [A1, A2 (exiting), A3 (exiting)]", () => {
        const stack = new LayoutStack()
        const bOpacity = motionValue(0)
        const a = makeChild(Presence.Present, "aOrigin", "aTarget")
        const b = makeChild(Presence.Exiting, "bOrigin", "bTarget", bOpacity)
        const c = makeChild(Presence.Exiting, "cOrigin", "cTarget")
        stack.add(a)
        update(stack)
        stack.add(b)
        update(stack)
        stack.add(c)
        update(stack)

        // A1
        expect(createCrossfadeAnimation(a, true, stack)).toEqual({
            originBox: "bOrigin",
            crossfadeOpacity: bOpacity,
        })

        // A2
        expect(createCrossfadeAnimation(b, true, stack)).toEqual({
            targetBox: "aTarget",
        })

        // A3
        expect(createCrossfadeAnimation(c, true, stack)).toEqual({
            visibilityAction: VisibilityAction.Hide,
        })
    })

    // test("Interrupting remove by removing to nothing: [, A2, A3 (exiting)] -interrupted-> [, A2 (exiting), A3 (exiting)]", () => {
    //     const stack = new LayoutStack()
    //     const a = makeChild(Presence.Exiting, "aOrigin", "aTarget")
    //     const b = makeChild(Presence.Exiting, "bOrigin", "bTarget")
    //     stack.add(a)
    //     update(stack)
    //     stack.add(b)
    //     update(stack)

    //     // A2
    //     expect(createCrossfadeAnimation(a, true, stack)).toEqual({
    //         crossfade: crossfadeOut,
    //     })

    //     // A3
    //     expect(createCrossfadeAnimation(b, true, stack)).toEqual({
    //         visibilityAction: VisibilityAction.Hide,
    //     })
    // })

    // test("Fade out final lead root component: [A1] -> [A1 (exiting)]", () => {
    //     const stack = new LayoutStack()
    //     const a = makeChild(Presence.Exiting, "aOrigin", "aTarget")
    //     stack.add(a)
    //     update(stack)

    //     // A1
    //     expect(createCrossfadeAnimation(a, true, stack)).toEqual({
    //         crossfade: crossfadeOut,
    //     })
    // })
})
