import { RefObject } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Target, TargetWithKeyframes } from "../types"

function isVariable(value: any): value is string {
    return typeof value === "string" && value.startsWith("var(--")
}

const variableParametersRegex = /var\((.*)+\)/

export function variableParameters(
    str: string
): {
    mainParameter: string | undefined
    fallbackParameter: string | undefined
} {
    const match = variableParametersRegex.exec(str)

    let mainParameter: string | undefined
    let fallbackParameter: string | undefined

    if (!match || !match[1]) {
        return { mainParameter, fallbackParameter }
    }

    const commaIndex = match[1].indexOf(",")
    if (commaIndex === -1) {
        mainParameter = match[1].trim()
    } else {
        mainParameter = match[1].slice(0, commaIndex).trim()
        fallbackParameter = match[1].slice(commaIndex + 1).trim()
    }

    return { mainParameter, fallbackParameter }
}

function getVariableValue(
    name: string,
    element: HTMLElement
): string | undefined {
    const { mainParameter, fallbackParameter } = variableParameters(name)

    if (!mainParameter) {
        return
    }

    const value = getComputedStyle(element).getPropertyValue(mainParameter)

    if (value) {
        return value
    } else if (isVariable(fallbackParameter)) {
        // Would be nice to prevent recursion
        return getVariableValue(fallbackParameter, element)
    } else {
        return fallbackParameter
    }
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
