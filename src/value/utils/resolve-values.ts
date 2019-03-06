import { MotionValue } from ".."
import { MotionValuesMap } from "../../motion/utils/use-motion-values"

export type Resolver = (value: MotionValue) => any

const createValueResolver = (resolver: Resolver) => (
    values: MotionValuesMap
) => {
    const resolvedValues = {}
    for (const key in values) {
        resolvedValues[key] = resolver(values[key])
    }

    return resolvedValues
}

export const resolveCurrent = createValueResolver(value => value.get())
