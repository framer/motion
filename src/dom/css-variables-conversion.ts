import { RefObject } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Target, TargetWithKeyframes } from "../types"

function isVariable(value: any): value is string {
    return typeof value === "string" && value.startsWith("var(--")
}

const VariableRegex = /var\(([^\),]+)/

function getVariableValue(
    name: string,
    element: HTMLElement
): string | undefined {
    const match = VariableRegex.exec(name)
    const customProperty = match ? match[1].trim() : ""
    return getComputedStyle(element).getPropertyValue(customProperty)
}

export function resolveVariables(
    values: MotionValuesMap,
    target: TargetWithKeyframes,
    transitionEnd: Target | undefined,
    ref: RefObject<Element>
): { target: TargetWithKeyframes; transitionEnd?: Target } {
    const { current: element } = ref
    if (!(element instanceof HTMLElement)) return { target, transitionEnd }

    values.forEach(value => {
        const name = value.get()
        if (isVariable(name)) {
            const variableValue = getVariableValue(name, element)
            if (variableValue) {
                value.set(variableValue)
            }
        }
    })

    let targetClone: TargetWithKeyframes | undefined
    let transitionEndClone: Target | undefined

    const keys = Object.keys(target)
    for (const key of keys) {
        const name = target[key]
        if (isVariable(name)) {
            const variableValue = getVariableValue(name, element)
            if (variableValue) {
                if (!targetClone) {
                    targetClone = { ...target }
                }
                targetClone[key] = variableValue
                if (!transitionEndClone) {
                    transitionEndClone = { ...transitionEnd }
                }
                if (transitionEndClone[key] === undefined) {
                    transitionEndClone[key] = name
                }
            }
        }
    }

    return {
        target: targetClone || target,
        transitionEnd: transitionEndClone || transitionEnd,
    }
}
