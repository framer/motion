import { Axis } from "../../../../types/geometry"
import { updateAxisDelta, scalePoint } from "../utils"

test("scalePoint", () => {
    expect(
        scalePoint({ scale: 2, originPoint: 0, origin: 0, translate: 0 }, 100)
    ).toEqual(200)
    expect(
        scalePoint({ scale: 0.5, originPoint: 0, origin: 0, translate: 0 }, 100)
    ).toEqual(50)
    expect(
        scalePoint({ scale: 3, originPoint: 500, origin: 0, translate: 0 }, 100)
    ).toEqual(-700)
})

const aSource: Axis = {
    min: 100,
    max: 300,
}

const aTarget: Axis = {
    min: 650,
    max: 750,
}

const bSource: Axis = {
    min: 0,
    max: 1,
}
const bTarget: Axis = {
    min: 0,
    max: 100,
}

const cSource: Axis = {
    min: 350,
    max: 450,
}

const cTarget: Axis = {
    min: 300,
    max: 500,
}

test("updateAxisDelta", () => {
    const delta = {
        translate: 0,
        origin: 0,
        originPoint: 0,
        scale: 0,
    }
    updateAxisDelta(delta, bSource, bTarget)
    expect(delta).toEqual({
        translate: 0,
        origin: 0,
        originPoint: 0,
        scale: 100,
    })
    updateAxisDelta(delta, bTarget, bSource)
    expect(delta).toEqual({
        translate: 0,
        origin: 0,
        originPoint: 0,
        scale: 0.01,
    })
    updateAxisDelta(delta, aSource, aTarget)
    expect(delta).toEqual({
        translate: 1100,
        origin: 0,
        originPoint: 0,
        scale: 0.5,
    })
    updateAxisDelta(delta, cSource, cTarget)
    expect(delta).toEqual({
        translate: 0,
        origin: 0.5,
        originPoint: 400,
        scale: 2,
    })
})
