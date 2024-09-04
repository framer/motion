import { Euler, Vector3, Color } from "three"
import { ThreeRenderState } from "../../types"
import { MathType } from "@react-three/fiber"

const setVector =
    (name: "scale" | "position" | "rotation", defaultValue: number) =>
    (i: number) =>
    (instance: MathType<any>, value: number) => {
        if (instance[name] === undefined) {
            instance[name] = new Vector3(defaultValue)
        }
        const vector = instance[name] as Vector3
        vector.setComponent(i, value)
    }

const setEuler =
    (name: string, defaultValue: number) =>
    (axis: "x" | "y" | "z") =>
    (instance: MathType<any>, value: number) => {
        if (instance[name] === undefined) {
            instance[name] = new Euler(defaultValue)
        }
        const euler = instance[name] as Euler
        euler[axis] = value
    }

const setColor = (name: string) => (instance: MathType<any>, value: string) => {
    if (instance[name] === undefined) {
        instance[name] = new Color(value)
    }
    instance[name].set(value)
}

const setScale = setVector("scale", 1)
const setPosition = setVector("position", 0)
const setRotation = setEuler("rotation", 0)

interface ThreeSetters {
    [key: string]: (instance: MathType<any>, value: string | number) => void
}

const setters: ThreeSetters = {
    x: setPosition(0),
    y: setPosition(1),
    z: setPosition(2),
    scale: (instance: MathType<any>, value: number) => {
        if (instance.scale === undefined) {
            instance.scale = new Vector3(1)
        }
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
    if (key in setters) {
        setters[key](instance, values[key as keyof typeof values] as any)
    } else {
        if (key === "opacity" && !instance.transparent) {
            instance.transparent = true
        }

        instance[key] = values[key as keyof typeof values] as any
    }
}
