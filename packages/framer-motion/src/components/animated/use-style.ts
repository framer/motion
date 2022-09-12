import { createStyles, MotionKeyframes } from "@motionone/dom"
import { CSSProperties, useContext, useMemo } from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { transformProps } from "../../render/html/utils/transform"
import { resolveVariantFromProps } from "../../render/utils/resolve-variants"
import { AnimationState } from "./state/AnimationState"

function filterTransform(style: CSSProperties) {
    const filtered = {}

    for (const key in style) {
        if (!transformProps.has(key)) {
            filtered[key] = style[key]
        }
    }

    return filtered
}

function getTarget(state: AnimationState): MotionKeyframes {
    const initialVariantSource =
        state.props.initial === false ? "animate" : "initial"

    const currentVariant =
        state.props[initialVariantSource] || state.context[initialVariantSource]

    if (!currentVariant || typeof currentVariant === "boolean") return {}

    const { transition, transitionEnd, ...target } =
        resolveVariantFromProps(state.props, currentVariant as any) || {}

    return target as MotionKeyframes
}

export function useStyle(
    state: AnimationState,
    style: CSSProperties
): CSSProperties {
    const { isStatic } = useContext(MotionConfigContext)

    const makeStyle = () => createStyles({ ...style, ...getTarget(state) })

    const animatedStyle = isStatic ? makeStyle() : useMemo(makeStyle, [])

    return {
        ...filterTransform(style),
        ...animatedStyle,
    }
}
