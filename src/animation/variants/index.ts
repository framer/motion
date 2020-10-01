import { MotionProps } from "../../motion/types"
import { VisualElement } from "../../render/VisualElement"
import {
    Target,
    TargetAndTransition,
    TargetResolver,
    Variant,
    Variants,
} from "../../types"
import { resolveFinalValueInKeyframes } from "../../utils/resolve-value"
import { motionValue } from "../../value"

export function isVariantLabel(
    v?: MotionProps["animate"]
): v is string | string[] {
    return typeof v === "string" || Array.isArray(v)
}

function setValue(
    visualElement: VisualElement,
    key: string,
    value: string | number
) {
    if (visualElement.hasValue(key)) {
        visualElement.getValue(key)!.set(value)
    } else {
        visualElement.addValue(key, motionValue(value))
    }
}

export function setValues(visualElement: VisualElement, target: Target) {
    for (const key in target) {
        setValue(
            visualElement,
            key,
            resolveFinalValueInKeyframes(target[key]) as string | number
        )
    }
}

function applyVariantList(
    visualElement: VisualElement,
    variantLabels: string[],
    variants: Variants,
    resolveData?: any
) {
    /**
     *
     */
    const reversedLabels = [...variantLabels].reverse()

    reversedLabels.forEach((key) => {
        const { transition, transitionEnd = {}, ...target } = resolveVariant(
            visualElement,
            variants[key],
            resolveData
        )

        setValues(visualElement, { ...target, ...transitionEnd } as Target)

        // TODO we missing children stuff here
        //             if (this.children && this.children.size) {
        //                 this.children.forEach((child) =>
        //                     child.applyVariantLabels(variantLabelList)
        //                 )
        //             }
    })
}

export function applyVariant(
    visualElement: VisualElement,
    variantLabel: string | string[],
    variants: Variants = {},
    resolveData?: any
) {
    applyVariantList(
        visualElement,
        Array.isArray(variantLabel) ? variantLabel : [variantLabel],
        variants,
        resolveData
    )
}

export function applyValues(
    visualElement: VisualElement,
    target: Target,
    variants?: Variants,
    resolveData?: any
) {
    if (isVariantLabel(target)) {
        applyVariant(visualElement, target, variants, resolveData)
    } else {
        setValues(visualElement, target)
    }
}

function isVariantResolver(variant: Variant): variant is TargetResolver {
    return typeof variant === "function"
}

function getCurrent(visualElement: VisualElement) {
    const current = {}
    visualElement.forEachValue((value, key) => (current[key] = value.get()))
    return current
}

function getVelocity(visualElement: VisualElement) {
    const velocity = {}
    visualElement.forEachValue(
        (value, key) => (velocity[key] = value.getVelocity())
    )
    return velocity
}

function resolveVariant(
    visualElement: VisualElement,
    variant?: Variant,
    resolveData?: any
): TargetAndTransition {
    if (!variant) {
        return {}
    } else if (isVariantResolver(variant)) {
        return variant(
            resolveData,
            getCurrent(visualElement),
            getVelocity(visualElement)
        )
    } else {
        return variant
    }
}
