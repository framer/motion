import { Object3DNode } from "@react-three/fiber"
import { Euler, Vector3, Color } from "three"
import { ThreeRenderState } from "../types"

const setVector =
    (name: string, defaultValue: number) =>
    (i: number) =>
    (instance: Object3DNode<any, any>, value: number) => {
        instance[name] ??= new Vector3(defaultValue)
        const vector = instance[name] as Vector3
        vector.setComponent(i, value)
    }

const setEuler =
    (name: string, defaultValue: number) =>
    (axis: string) =>
    (instance: Object3DNode<any, any>, value: number) => {
        instance[name] ??= new Euler(defaultValue)
        const euler = instance[name] as Euler
        euler[axis] = value
    }

const setColor =
    (name: string) => (instance: Object3DNode<any, any>, value: string) => {
        instance[name] ??= new Color(value)
        instance[name].set(value)
    }

const setScale = setVector("scale", 1)
const setPosition = setVector("position", 0)
const setRotation = setEuler("rotation", 0)

const setters = {
    x: setPosition(0),
    y: setPosition(1),
    z: setPosition(2),
    scale: (instance: Object3DNode<any, any>, value: number) => {
        instance.scale ??= new Vector3(1)
        const scale = instance.scale as Vector3
        scale.set(value, value, value)
    },
    scaleX: setScale(0),
    scaleY: setScale(1),
    scaleZ: setScale(2),
    rotateX: setRotation("x"),
    rotateY: setRotation("y"),
    rotateZ: setRotation("z"),
    color: setColor("color"),
    specular: setColor("specular"),
}

export function setThreeValue(
    instance: any,
    key: string,
    values: ThreeRenderState
): void {
    if (setters[key]) {
        setters[key](instance, values[key])
    } else {
        instance[key] = values[key]
    }
}
