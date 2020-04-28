import { createSwitchAnimation, createCrossfadeAnimation } from "../animations"
import { StackQuery, Presence, StackPosition, VisibilityAction } from "../types"

describe("createSwitchAnimation", () => {
    test("[A1] -> [A2]", () => {
        const stack: Partial<StackQuery> = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Lead,
                    prevPosition: StackPosition.Lead,
                    presence: Presence.Entering,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({ origin: { isOrigin: true } })
    })

    test("[A1] -> [A1]", () => {
        const stack: Partial<StackQuery> = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Lead,
                    prevPosition: StackPosition.Lead,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({})
    })

    test("[A1] -> [A1, A2]", () => {
        const stack: Partial<StackQuery> = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // Normal animate component
        expect(
            createSwitchAnimation(
                {
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({})

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    prevPosition: StackPosition.Lead,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({ visibilityAction: VisibilityAction.Hide })

        // A2
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Lead,
                    prevPosition: StackPosition.Lead,
                    presence: Presence.Entering,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({ origin: { isOrigin: true } })
    })

    test("[A1, A2] -> [A1, A2 (exiting)]", () => {
        const stack: Partial<StackQuery> = {
            isLeadPresent: () => false,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // Normal animate component
        expect(
            createSwitchAnimation(
                {
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({})

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    prevPosition: StackPosition.Previous,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({})

        // A2
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Lead,
                    prevPosition: StackPosition.Lead,
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({ target: { isTarget: true } })
    })

    test("[A1, A2 (exiting)] -> [A1]", () => {
        const stack: Partial<StackQuery> = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => ({ isOrigin: true } as any),
            getPreviousTarget: () => ({ isTarget: true } as any),
        }

        // A1
        expect(
            createSwitchAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Lead,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack as any
            )
        ).toEqual({ visibilityAction: VisibilityAction.Show })
    })
})

describe("createCrossfadeAnimation", () => {
    test("Switching root components: [A1] -> [A1 (exiting), A2]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Entering,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }
        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ target: "leadTarget", crossfade: 0 })
        // A2
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            origin: "previousOrigin",
            crossfade: 1,
        })
    })

    test("Switching components: [A1] -> [A1 (exiting), A2]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Entering,
            depth: 1,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: depth => depth === 0,
            getCrossfadeOut: () => 0,
            getCrossfadeIn: () => 1,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }

        // Animate root
        expect(
            createCrossfadeAnimation(
                {
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ crossfade: 0 })

        expect(
            createCrossfadeAnimation(
                {
                    presence: Presence.Entering,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ crossfade: 1 })
        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Exiting,
                    depth: 1,
                },
                stack
            )
        ).toEqual({ target: "leadTarget" })
        // A2
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            origin: "previousOrigin",
        })
    })

    test("Interrupting switch animation: [A1 (exiting), A2] -interrupted-> [A1, A2 (exiting)]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Exiting,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }
        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Entering,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ origin: "leadOrigin", crossfade: 1 })
        // A2
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            target: "previousTarget",
            crossfade: 0,
        })
    })

    test("Adding: [A1] -> [A1, A2]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Entering,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }

        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ target: "leadTarget", crossfade: 0 })

        // A2
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            origin: "previousOrigin",
            crossfade: 1,
        })
    })

    test("Removing: [A1, A2] -> [A1]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Present,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }
        // A1
        expect(createCrossfadeAnimation(lead, stack)).toEqual({})
    })

    test("Interrupting remove with new component: [A1, A2 (exiting)] -interrupted-> [A1, A2 (exiting), A3]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Entering,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }
        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ target: "leadTarget", crossfade: 0 })

        // A2
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ visibilityAction: VisibilityAction.Hide })

        // A3
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            origin: "previousOrigin",
            crossfade: 1,
        })
    })

    test("Interrupting remove by removing: [A1, A2, A3 (exiting)] -interrupted-> [A1, A2 (exiting), A3 (exiting)]", () => {
        const lead = {
            layoutId: "a",
            position: StackPosition.Lead,
            presence: Presence.Exiting,
            depth: 0,
        }

        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => lead,
        }
        // A1
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Present,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ origin: "leadOrigin", crossfade: 1 })

        // A2
        expect(createCrossfadeAnimation(lead, stack)).toEqual({
            target: "previousTarget",
            crossfade: 0,
        })

        // A3
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ visibilityAction: VisibilityAction.Hide })
    })

    test("Interrupting remove by removing to nothing: [, A2, A3 (exiting)] -interrupted-> [, A2 (exiting), A3 (exiting)]", () => {
        const stack: StackQuery = {
            isLeadPresent: () => true,
            getPreviousOrigin: () => "previousOrigin" as any,
            getPreviousTarget: () => "previousTarget" as any,
            isRootDepth: () => true,
            getCrossfadeOut: () => 0 as any,
            getCrossfadeIn: () => 1 as any,
            getLeadOrigin: () => "leadOrigin" as any,
            getLeadTarget: () => "leadTarget" as any,
            getLead: () => undefined,
        }

        // A2
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    position: StackPosition.Previous,
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ crossfade: 0 })

        // A3
        expect(
            createCrossfadeAnimation(
                {
                    layoutId: "a",
                    presence: Presence.Exiting,
                    depth: 0,
                },
                stack
            )
        ).toEqual({ visibilityAction: VisibilityAction.Hide })
    })
})

test("Fade out final lead root component: [A1] -> [A1 (exiting)]", () => {
    const lead = {
        layoutId: "a",
        position: StackPosition.Lead,
        presence: Presence.Exiting,
        depth: 0,
    }

    const stack: StackQuery = {
        isLeadPresent: () => true,
        getPreviousOrigin: () => undefined as any,
        getPreviousTarget: () => undefined as any,
        isRootDepth: () => true,
        getCrossfadeOut: () => 0 as any,
        getCrossfadeIn: () => 1 as any,
        getLeadOrigin: () => undefined as any,
        getLeadTarget: () => undefined as any,
        getLead: () => lead,
    }
    // A1
    expect(
        createCrossfadeAnimation(
            {
                layoutId: "a",
                position: StackPosition.Lead,
                presence: Presence.Exiting,
                depth: 0,
            },
            stack
        )
    ).toEqual({ crossfade: 0 })
})
