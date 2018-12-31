import { MotionValue } from "../motion-value"
import { getTransition } from "../utils/transitions"
import { invariant } from "hey-listen"
import { TransitionProp } from "../motion/types"

type ValueMap = { [key: string]: MotionValue }
type Values = ValueMap | MotionValue

type TargetMap = { [key: string]: string | number }
type Target = string | number | TargetMap

const isMap = <T>(v: any): v is T => typeof v === "object" && !(v instanceof MotionValue)

const createAnimation = (values: Values, target: Target, opts: TransitionProp) => {
    invariant(
        isMap<ValueMap>(values) === isMap<TargetMap>(target),
        "*Both* values and animation targets must be either a single value or an object of values"
    )

    if (!isMap<ValueMap>(values) && !isMap<TargetMap>(target)) {
        values = { default: values }
        target = { default: target }
    }

    return {
        start: () => {
            // TODO: Could be some refactoring with `use-pose-resolver`
            const animations = Object.keys(values).reduce(
                (acc, key) => {
                    const value = values[key]
                    const [action, actionOpts] = getTransition(key, target[key], opts)

                    acc.push(value.control(action, actionOpts))

                    return acc
                },
                [] as Promise<any>[]
            )

            return Promise.all(animations)
        },
        stop: () => {
            Object.keys(values).forEach(key => values[key].stop())
        },
    }
}

export { createAnimation }
