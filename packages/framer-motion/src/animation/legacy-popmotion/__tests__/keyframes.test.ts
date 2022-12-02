import {
    keyframes,
    defaultEasing,
    defaultOffset,
    convertOffsetToTimes,
} from "../keyframes"
import { noop } from "../../../utils/noop"
import { animateSync } from "./utils"
import { easeInOut } from "../../../easing/ease"

const linear = noop

describe("defaultEasing", () => {
    test("returns a default easing array", () => {
        expect(defaultEasing([0, 1], linear)).toEqual([linear])
        expect(defaultEasing([0, 1, 2], linear)).toEqual([linear, linear])
        expect(defaultEasing([0, 1, 2])).toEqual([easeInOut, easeInOut])
    })
})

describe("defaultOffset", () => {
    test("returns a default times array", () => {
        expect(defaultOffset([0, 1])).toEqual([0, 1])
        expect(defaultOffset([0, 1, 2])).toEqual([0, 0.5, 1])
        expect(defaultOffset([0, 1, 2, 3])).toEqual([0, 1 / 3, (1 / 3) * 2, 1])
    })
})

describe("convertOffsetToTimes", () => {
    test("converts offsets to times", () => {
        expect(convertOffsetToTimes([0, 0.5, 1], 500)).toEqual([0, 250, 500])
    })
})

describe("keyframes", () => {
    test("runs a default animation", () => {
        expect(animateSync(keyframes({ to: 100 }), 20)).toEqual([
            0, 1, 4, 8, 14, 22, 32, 44, 56, 68, 78, 86, 92, 96, 99, 100,
        ])
    })

    test("adjusts with duration defined", () => {
        expect(
            animateSync(keyframes({ to: 100, duration: 100, ease: linear }), 20)
        ).toEqual([0, 20, 40, 60, 80, 100])
    })

    test("animates through keyframes", () => {
        expect(
            animateSync(
                keyframes({ to: [50, 100, -100], duration: 200, ease: linear }),
                20
            )
        ).toEqual([50, 60, 70, 80, 90, 100, 60, 20, -20, -60, -100])
    })

    test("animates colors", () => {
        expect(
            animateSync(
                keyframes({
                    to: ["#fff", "#000"] as any,
                    duration: 100,
                    ease: linear,
                }),
                20,
                false
            )
        ).toEqual([
            "rgba(255, 255, 255, 1)",
            "rgba(228, 228, 228, 1)",
            "rgba(198, 198, 198, 1)",
            "rgba(161, 161, 161, 1)",
            "rgba(114, 114, 114, 1)",
            "rgba(0, 0, 0, 1)",
        ])
    })
})
