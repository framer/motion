import { MotionValue } from "../motion-value"

export type Resolver = (value: MotionValue) => any

const createValueResolver = (resolver: Resolver) => (values: Map<string, MotionValue>) => {
    const resolvedValues = {}
    values.forEach((value, key) => (resolvedValues[key] = resolver(value)))
    return resolvedValues
}

export const resolveCurrent = createValueResolver(value => value.get())
export const resolveVelocity = createValueResolver(value => value.getVelocity())
