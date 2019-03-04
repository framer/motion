import { MotionValue } from ".."
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { CustomStyleMap } from "../../motion/context/MotionPluginContext"

export type Resolver = (value: MotionValue) => any

const createValueResolver = (resolver: Resolver) => (
    values: MotionValuesMap,
    customStyles?: CustomStyleMap
) => {
    const resolvedValues = {}
    values.forEach((value, key) => {
        if (customStyles && customStyles[key]) {
            const resolved = customStyles[key].transformToStyles(
                resolver(value)
            )
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
