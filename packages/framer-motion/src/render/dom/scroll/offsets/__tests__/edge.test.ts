import { resolveEdge } from "../edge"

describe("resolveEdge", () => {
  test("It handles progress numbers", () => {
    expect(resolveEdge(0, 300)).toEqual(0)
    expect(resolveEdge(0, 300, 200)).toEqual(200)
    expect(resolveEdge(0.5, 300)).toEqual(150)
    expect(resolveEdge(0.5, 300, 200)).toEqual(350)
    expect(resolveEdge(1, 300)).toEqual(300)
    expect(resolveEdge(1, 300, 200)).toEqual(500)
  })

  test("It handles progress numbers as string", () => {
    expect(resolveEdge("0", 300)).toEqual(0)
    expect(resolveEdge("0", 300, 200)).toEqual(200)
    expect(resolveEdge("0.5", 300)).toEqual(150)
    expect(resolveEdge("0.5", 300, 200)).toEqual(350)
    expect(resolveEdge("1", 300)).toEqual(300)
    expect(resolveEdge("1", 300, 200)).toEqual(500)
  })

  test("It handles named presets", () => {
    expect(resolveEdge("start", 300)).toEqual(0)
    expect(resolveEdge("start", 300, 200)).toEqual(200)
    expect(resolveEdge("center", 300)).toEqual(150)
    expect(resolveEdge("center", 300, 200)).toEqual(350)
    expect(resolveEdge("end", 300)).toEqual(300)
    expect(resolveEdge("end", 300, 200)).toEqual(500)
  })

  test("It handles pixels", () => {
    expect(resolveEdge("0px", 300)).toEqual(0)
    expect(resolveEdge("0px", 300, 200)).toEqual(200)
    expect(resolveEdge("150px", 300)).toEqual(150)
    expect(resolveEdge("150px", 300, 200)).toEqual(350)
    expect(resolveEdge("300px", 300)).toEqual(300)
    expect(resolveEdge("300px", 300, 200)).toEqual(500)
  })

  test("It handles percent", () => {
    expect(resolveEdge("0%", 300)).toEqual(0)
    expect(resolveEdge("0%", 300, 200)).toEqual(200)
    expect(resolveEdge("50%", 300)).toEqual(150)
    expect(resolveEdge("50%", 300, 200)).toEqual(350)
    expect(resolveEdge("100%", 300)).toEqual(300)
    expect(resolveEdge("100%", 300, 200)).toEqual(500)
  })

  test("It handles vw", () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: 1000,
    })

    expect(resolveEdge("0vw", 300)).toEqual(0)
    expect(resolveEdge("0vw", 300, 200)).toEqual(200)
    expect(resolveEdge("50vw", 300)).toEqual(500)
    expect(resolveEdge("50vw", 300, 200)).toEqual(700)
    expect(resolveEdge("100vw", 300)).toEqual(1000)
    expect(resolveEdge("100vw", 300, 200)).toEqual(1200)
  })

  test("It handles vh", () => {
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 1000,
    })

    expect(resolveEdge("0vh", 300)).toEqual(0)
    expect(resolveEdge("0vh", 300, 200)).toEqual(200)
    expect(resolveEdge("50vh", 300)).toEqual(500)
    expect(resolveEdge("50vh", 300, 200)).toEqual(700)
    expect(resolveEdge("100vh", 300)).toEqual(1000)
    expect(resolveEdge("100vh", 300, 200)).toEqual(1200)
  })
})
