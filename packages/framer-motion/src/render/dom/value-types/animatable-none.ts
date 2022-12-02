import { complex } from "../../../value/types/complex"
import { filter } from "../../../value/types/complex/filter"
import { getDefaultValueType } from "./defaults"

export function getAnimatableNone(key: string, value: string) {
    let defaultValueType = getDefaultValueType(key)
    if (defaultValueType !== filter) defaultValueType = complex
    // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
    return defaultValueType.getAnimatableNone?.(value)
}
