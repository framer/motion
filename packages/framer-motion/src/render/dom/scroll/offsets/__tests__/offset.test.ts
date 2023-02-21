import { resolveOffset } from "../offset"

describe("resolveOffset", () => {
  test("Can resolve single-value numerical edge", () => {
    expect(resolveOffset(0, 100, 500, 0)).toEqual(0)
    expect(resolveOffset(0.5, 100, 500, 0)).toEqual(200)
    expect(resolveOffset(1, 100, 500, 0)).toEqual(400)
    expect(resolveOffset(0, 100, 500, 200)).toEqual(200)
    expect(resolveOffset(0.5, 100, 500, 200)).toEqual(400)
    expect(resolveOffset(1, 100, 500, 200)).toEqual(600)
  })

  test("Can resolve single-value labelled edge", () => {
    expect(resolveOffset("start", 100, 500, 0)).toEqual(0)
    expect(resolveOffset("center", 100, 500, 0)).toEqual(200)
    expect(resolveOffset("end", 100, 500, 0)).toEqual(400)
    expect(resolveOffset("start", 100, 500, 200)).toEqual(200)
    expect(resolveOffset("center", 100, 500, 200)).toEqual(400)
    expect(resolveOffset("end", 100, 500, 200)).toEqual(600)
  })

  test("Can resolve single-value px", () => {
    expect(resolveOffset("100px", 100, 500, 0)).toEqual(100)
    expect(resolveOffset("500px", 100, 500, 0)).toEqual(500)
    expect(resolveOffset("100px", 100, 500, 200)).toEqual(300)
    expect(resolveOffset("500px", 100, 500, 200)).toEqual(700)
  })

  test("Can resolve string intersection", () => {
    expect(resolveOffset("center start", 100, 50, 0)).toEqual(25)
    expect(resolveOffset("start center", 100, 200, 0)).toEqual(-50)
    expect(resolveOffset("start end", 100, 200, 0)).toEqual(-100)
    expect(resolveOffset("0.5 0", 100, 50, 0)).toEqual(25)
    expect(resolveOffset("0 0.5", 100, 200, 0)).toEqual(-50)
    expect(resolveOffset("0 1", 100, 200, 0)).toEqual(-100)
  })

  test("Can resolve numerical intersection", () => {
    expect(resolveOffset([0, 0], 100, 50, 0)).toEqual(0)
    expect(resolveOffset([0, 0], 100, 50, 200)).toEqual(200)
    expect(resolveOffset([0, 1], 100, 50, 0)).toEqual(-100)
    expect(resolveOffset([0, 1], 100, 200, 0)).toEqual(-100)
    expect(resolveOffset([0, 1], 100, 50, 200)).toEqual(100)
    expect(resolveOffset([0, 1], 100, 200, 200)).toEqual(100)
    expect(resolveOffset([1, 1], 100, 50, 0)).toEqual(-50)
    expect(resolveOffset([1, 1], 100, 200, 0)).toEqual(100)
    expect(resolveOffset([1, 1], 100, 50, 200)).toEqual(150)
    expect(resolveOffset([1, 0], 100, 50, 0)).toEqual(50)
    expect(resolveOffset([1, 0], 100, 200, 0)).toEqual(200)
    expect(resolveOffset([1, 0], 100, 50, 200)).toEqual(250)
    expect(resolveOffset([1, 0], 100, 200, 200)).toEqual(400)
  })
})
