import { isPrimaryPointer } from "../is-primary-pointer"

describe("isPrimaryPointer", () => {
    test("Identifies primary pointer", () => {
        expect(
            isPrimaryPointer({
                button: 1,
                isPrimary: true,
                type: "mouse",
            } as any)
        ).toEqual(false)
        expect(
            isPrimaryPointer({
                button: 1,
                isPrimary: true,
                type: "touch",
            } as any)
        ).toEqual(true)
        expect(
            isPrimaryPointer({
                button: 0,
                isPrimary: true,
                type: "mouse",
            } as any)
        ).toEqual(true)
        expect(
            isPrimaryPointer({
                button: -1,
                isPrimary: false,
                type: "mouse",
            } as any)
        ).toEqual(true)
        expect(
            isPrimaryPointer({
                button: undefined,
                isPrimary: false,
                type: "mouse",
            } as any)
        ).toEqual(true)
        expect(
            isPrimaryPointer({
                button: null,
                isPrimary: false,
                type: "mouse",
            } as any)
        ).toEqual(true)
    })
})
