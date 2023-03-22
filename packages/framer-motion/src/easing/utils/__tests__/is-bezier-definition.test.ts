import { isBezierDefinition } from "../is-bezier-definition"

describe("isBezierDefinition", () => {
    expect(isBezierDefinition("linear")).toEqual(false)
    expect(isBezierDefinition((v) => v)).toEqual(false)
    expect(isBezierDefinition(["linear"])).toEqual(false)
    expect(isBezierDefinition([0, 1, 2, 3])).toEqual(true)
})
