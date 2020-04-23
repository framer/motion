import { createSwitchAnimation } from "../animations"
import { StackQuery, Presence } from "../types"
import { VisibilityAction } from "../../../motion/features/auto/types"

describe("createSwitchAnimation", () => {
    test("[A1] -> [A2]", () => {
        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: true,
                    wasLead: false,
                    presence: Presence.Entering,
                },
                stack
            )
        ).toEqual({ origin: { isOrigin: true } })
    })

    test("[A1] -> [A1, A2]", () => {
        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // Normal animate component
        expect(
            createSwitchAnimation(
                {
                    layoutId: undefined,
                    isLead: false,
                    wasLead: false,
                    presence: Presence.Present,
                },
                stack
            )
        ).toEqual({})

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: false,
                    wasLead: true,
                    presence: Presence.Present,
                },
                stack
            )
        ).toEqual({ visibilityAction: VisibilityAction.Hide })

        // A2
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: true,
                    wasLead: false,
                    presence: Presence.Entering,
                },
                stack
            )
        ).toEqual({ origin: { isOrigin: true } })
    })

    test("[A1, A2] -> [A1, A2 (exiting)]", () => {
        const stack: StackQuery = {
            isLeadPresent: () => false,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // Normal animate component
        expect(
            createSwitchAnimation(
                {
                    layoutId: undefined,
                    isLead: false,
                    wasLead: false,
                    presence: Presence.Present,
                },
                stack
            )
        ).toEqual({})

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: false,
                    wasLead: false,
                    presence: Presence.Present,
                },
                stack
            )
        ).toEqual({})

        // A2
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: true,
                    wasLead: true,
                    presence: Presence.Exiting,
                },
                stack
            )
        ).toEqual({ target: { isTarget: true } })
    })

    test("[A1, A2] -> [A1]", () => {
        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    isLead: true,
                    wasLead: false,
                    presence: Presence.Present,
                },
                stack
            )
        ).toEqual({ visibilityAction: VisibilityAction.Show })
    })
})

describe("createCrossfadeAnimation", () => {
    test("should correctly return data describing a switch animation", () => {
        test("Switching components: [A1] -> [A1 (exiting), A2]", () => {})

        test("Interrupting switch animation: [A1 (exiting), A2] -interrupted-> [A1, A2 (exiting)]", () => {})

        test("Adding: [A1] -> [A1, A2]", () => {})

        test("Removing: [A1, A2] -> [A1]", () => {})

        test("Interrupting remove with new component: [A1, A2 (exiting)] -interrupted-> [A1, A2 (exiting), A3]", () => {})

        test("Interrupting remove by removing: [A1, A2, A3 (exiting)] -interrupted-> [A1, A2 (exiting), A3 (exiting)]", () => {})
    })
})
