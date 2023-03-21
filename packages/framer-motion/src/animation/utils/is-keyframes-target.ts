import { GenericKeyframes, ValueKeyframesDefinition } from "../types"

export const isKeyframesTarget = (
    v: ValueKeyframesDefinition
): v is GenericKeyframes<any> => {
    return Array.isArray(v)
}
