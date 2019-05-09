import "../../../jest.setup"
import { getAnimation } from "../utils/transitions"
import { motionValue } from "../../value"
import { inertia } from "popmotion"
import { just } from "../utils/just"

test("getAnimation correctly returns Popmotion animations", () => {
    const testValue = motionValue(0)
    expect(
        getAnimation("foo", testValue, 100, {
            type: "inertia",
            velocity: 1000,
            bounceStiffness: 300000,
            bounceDamping: 1000000,
            timeConstant: 750,
            restDelta: 1,
            delay: 100,
        })
    ).toEqual([
        inertia,
        {
            from: 0,
            to: 100,
            delay: 100,
            velocity: 1000,
            bounceStiffness: 300000,
            bounceDamping: 1000000,
            timeConstant: 750,
            restDelta: 1,
        },
    ])

    expect(getAnimation("foo", motionValue("block"), 100, {})[0]).toEqual(just)
})
