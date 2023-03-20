import { Easing } from "../../easing/types"
import { DynamicOption } from "../types"
import { easingDefinitionToFunction } from "./easing"

export type From = "first" | "last" | "center" | number

export type StaggerOptions = {
    start?: number
    from?: From
    easing?: Easing
}

export function getFromIndex(from: From, total: number) {
    if (from === "first") {
        return 0
    } else {
        const lastIndex = total - 1
        return from === "last" ? lastIndex : lastIndex / 2
    }
}

export function stagger(
    duration: number = 0.1,
    { start = 0, from = 0, easing }: StaggerOptions = {}
): DynamicOption<number> {
    return (i: number, total: number) => {
        const fromIndex =
            typeof from === "number" ? from : getFromIndex(from, total)
        const distance = Math.abs(fromIndex - i)
        let delay = duration * distance

        if (easing) {
            const maxDelay = total * duration
            const easingFunction = easingDefinitionToFunction(easing)
            delay = easingFunction(delay / maxDelay) * maxDelay
        }

        return start + delay
    }
}
