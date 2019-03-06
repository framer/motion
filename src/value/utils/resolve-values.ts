import { MotionValue } from ".."
import { MotionValuesMap } from "../../motion/utils/use-motion-values"

export type Resolver = (value: MotionValue) => any

const createValueResolver = (resolver: Resolver) => (
    values: MotionValuesMap
) => {
    const resolvedValues = {}
    values.forEach((value, key) => (resolvedValues[key] = resolver(value)))

    return resolvedValues
}

export const resolveCurrent = createValueResolver(value => value.get())
