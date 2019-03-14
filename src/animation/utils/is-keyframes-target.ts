import { ValueTarget, KeyframesTarget } from "../../types"

export const isKeyframesTarget = (v: ValueTarget): v is KeyframesTarget => {
    return Array.isArray(v)
}
