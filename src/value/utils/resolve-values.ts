import { MotionValue } from ".."
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { CustomValueMap } from "../../motion/context/MotionPluginContext"

export type Resolver = (value: MotionValue) => any

const createValueResolver = (resolver: Resolver) => (
    values: MotionValuesMap,
    customValues?: CustomValueMap
) => {
    const resolvedValues = {}
    values.forEach((value, key) => {
        if (customValues && customValues[key]) {
            const resolved = customValues[key].transform(resolver(value))
            for (const resolvedKey in resolved) {
                resolvedValues[resolvedKey] = resolved[resolvedKey]
            }
        } else {
            resolvedValues[key] = resolver(value)
        }
    })

    return resolvedValues
}

export const resolveCurrent = createValueResolver(value => value.get())
