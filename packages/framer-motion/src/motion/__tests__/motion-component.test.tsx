import {
    createMotionComponent,
    isMotionComponent,
    motion,
    unwrapMotionComponent,
} from "../.."

function CustomComp() {
    return <div />
}

describe("isMotionComponent", () => {
    it("returns true for motion components", () => {
        expect(isMotionComponent(motion.div)).toBe(true)
        expect(isMotionComponent(createMotionComponent(CustomComp))).toBe(true)
    })

    it("returns false for other components", () => {
        expect(isMotionComponent("div")).toBe(false)
        expect(isMotionComponent(CustomComp)).toBe(false)
    })
})

describe("unwrapMotionComponent", () => {
    it("returns the wrapped component for motion components", () => {
        expect(unwrapMotionComponent(motion.div)).toBe("div")
        expect(unwrapMotionComponent(createMotionComponent(CustomComp))).toBe(
            CustomComp
        )
    })

    it("returns undefined for other components", () => {
        expect(unwrapMotionComponent("div")).toBe(undefined)
        expect(unwrapMotionComponent(CustomComp)).toBe(undefined)
    })
})
