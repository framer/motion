import type { MotionValue } from "."
import { useCombineMotionValues } from "./use-combine-values"

let collectMotionValues: MotionValue[] | undefined = undefined

export function useComputed<O>(compute: () => O): MotionValue<O> {
    collectMotionValues = []
    compute()
    const value = useCombineMotionValues(collectMotionValues, compute)
    collectMotionValues = undefined

    return value
}
