import { GroupPlaybackControls } from "../GroupPlaybackControls"
import { AnimationPlaybackControls } from "../types"

describe("GroupPlaybackControls", () => {
    test("Filters undefined animations", () => {
        const a: AnimationPlaybackControls = {
            currentTime: 1,
            stop: () => {},
        }

        const controls = new GroupPlaybackControls([undefined, a])

        expect(controls.animations[0]).toBe(a)
    })

    test("Gets currentTime", () => {
        const a: AnimationPlaybackControls = {
            currentTime: 5,
            stop: () => {},
        }

        const controls = new GroupPlaybackControls([a])

        expect(controls.currentTime).toBe(5)
    })

    test("Sets currentTime", () => {
        const a: AnimationPlaybackControls = {
            currentTime: 5,
            stop: () => {},
        }

        const b: AnimationPlaybackControls = {
            currentTime: 5,
            stop: () => {},
        }

        const controls = new GroupPlaybackControls([a, b])

        controls.currentTime = 1

        expect(a.currentTime).toBe(1)
        expect(b.currentTime).toBe(1)
    })

    test("Calls stop on all animations", () => {
        const a: AnimationPlaybackControls = {
            currentTime: 5,
            stop: jest.fn(),
        }

        const b: AnimationPlaybackControls = {
            currentTime: 5,
            stop: jest.fn(),
        }

        const controls = new GroupPlaybackControls([a, b])

        controls.stop()

        expect(a.stop).toBeCalledTimes(1)
        expect(b.stop).toBeCalledTimes(1)
    })
})
