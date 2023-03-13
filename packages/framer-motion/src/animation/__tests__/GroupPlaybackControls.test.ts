import { GroupPlaybackControls } from "../GroupPlaybackControls"
import { AnimationPlaybackControls } from "../types"

function createTestAnimationControls(
    partialControls?: Partial<AnimationPlaybackControls>
) {
    return {
        currentTime: 1,
        stop: () => {},
        play: () => {},
        pause: () => {},
        ...partialControls,
    }
}

describe("GroupPlaybackControls", () => {
    test("Filters undefined animations", () => {
        const a: AnimationPlaybackControls = createTestAnimationControls()

        const controls = new GroupPlaybackControls([undefined, a])

        expect(controls.animations[0]).toBe(a)
    })

    test("Gets currentTime", () => {
        const a: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
        })

        const controls = new GroupPlaybackControls([a])

        expect(controls.currentTime).toBe(5)
    })

    test("Sets currentTime", () => {
        const a: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
        })

        const b: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
        })

        const controls = new GroupPlaybackControls([a, b])

        controls.currentTime = 1

        expect(a.currentTime).toBe(1)
        expect(b.currentTime).toBe(1)
    })

    test("Calls play on all animations", () => {
        const a: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
            play: jest.fn(),
        })

        const b: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
            play: jest.fn(),
        })

        const controls = new GroupPlaybackControls([a, b])

        controls.play()

        expect(a.play).toBeCalledTimes(1)
        expect(b.play).toBeCalledTimes(1)
    })

    test("Calls pause on all animations", () => {
        const a: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
            pause: jest.fn(),
        })

        const b: AnimationPlaybackControls = createTestAnimationControls({
            currentTime: 5,
            pause: jest.fn(),
        })

        const controls = new GroupPlaybackControls([a, b])

        controls.pause()

        expect(a.pause).toBeCalledTimes(1)
        expect(b.pause).toBeCalledTimes(1)
    })
})
