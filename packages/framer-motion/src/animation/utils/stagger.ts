import { Easing } from "../../easing/types"
import { DynamicOption } from "../types"
import { easingDefinitionToFunction } from "./easing"

export type StaggerOrigin = "first" | "last" | "center" | number

export type StaggerOptions = {
    startDelay?: number
    origin?: StaggerOrigin
    ease?: Easing
}

export function getOriginIndex(origin: StaggerOrigin, total: number) {
    if (origin === "first") {
        return 0
    } else {
        const lastIndex = total - 1
        return origin === "last" ? lastIndex : lastIndex / 2
    }
}

export function stagger(
    duration: number = 0.1,
    { startDelay = 0, origin = 0, ease }: StaggerOptions = {}
): DynamicOption<number> {
    return (i: number, total: number) => {
        const originIndex =
            typeof origin === "number" ? origin : getOriginIndex(origin, total)
        const distance = Math.abs(originIndex - i)
        let delay = duration * distance

        if (ease) {
            const maxDelay = total * duration
            const easingFunction = easingDefinitionToFunction(ease)
            delay = easingFunction(delay / maxDelay) * maxDelay
        }

        return startDelay + delay
    }
}
