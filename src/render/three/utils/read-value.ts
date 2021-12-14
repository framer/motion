import { Object3DNode } from "@react-three/fiber"
import { Color } from "three"

const readVector =
    (name: string, defaultValue: number) =>
    (axis: "x" | "y" | "z") =>
    (instance: Object3DNode<any, any>) => {
        const value = instance[name]
        return value ? value[axis] : defaultValue
    }

const readPosition = readVector("position", 0)
const readScale = readVector("scale", 1)
const readRotation = readVector("rotation", 0)

const readers = {
    x: readPosition("x"),
    y: readPosition("y"),
    z: readPosition("z"),
    scale: readScale("x"),
    scaleX: readScale("x"),
    scaleY: readScale("y"),
    scaleZ: readScale("z"),
    rotateX: readRotation("x"),
    rotateY: readRotation("y"),
    rotateZ: readRotation("z"),
}

function readAnimatableValue(value?: Color) {
    if (value === undefined) {
        return
    } else if (value instanceof Color) {
        return value.getStyle()
    } else {
        return value
    }
}

export function readThreeValue(instance: Object3DNode<any, any>, name: string) {
    return readers[name]
        ? readers[name](instance)
        : readAnimatableValue(instance[name]) ?? 0
}
