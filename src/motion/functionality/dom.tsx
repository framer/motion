import * as React from "react"
import { MotionProps } from "../types"
import { createElement, ComponentType, RefObject, CSSProperties } from "react"
import { buildStyleAttr } from "../utils/use-styles"
import { MotionValuesMap } from "../utils/use-motion-values"
import isPropValid from "@emotion/is-prop-valid"
import { svgElements } from "../utils/supported-elements"
import { gestureProps, gestures } from "./gestures"
import { MotionComponentConfig } from "../component"
import { drag } from "./drag"

type RenderProps<P> = {
    props: P & MotionProps
    innerRef: RefObject<Element | null>
    style: CSSProperties
    values: MotionValuesMap
    isStatic: boolean
}

const eventHandlers = new Set([
    "onAnimationComplete",
    "onUpdate",
    "onDragStart",
    "onDrag",
    "onDragEnd",
    "onDirectionLock",
    "onDragTransitionEnd",
    ...gestureProps,
])

const validProps = (props: MotionProps) => {
    const valid = {}

    for (const key in props) {
        if (isPropValid(key) && !eventHandlers.has(key)) {
            valid[key] = props[key]
        }
    }

    return valid
}

export function createDomMotionConfig<P>(
    Component: string | ComponentType<P>
): MotionComponentConfig {
    const isDOM = typeof Component === "string"
    const isSVG = isDOM && svgElements.indexOf(Component as any) !== -1

    const RenderComponent = ({
        props,
        innerRef,
        style,
        values,
        isStatic,
    }: RenderProps<P>) => {
        const forwardProps = isDOM ? validProps(props) : props

        return createElement<any>(Component, {
            ...forwardProps,
            ref: innerRef,
            style: isSVG ? style : buildStyleAttr(values, style, isStatic),
        })
    }

    return {
        useFunctionalityComponents: (
            props,
            values,
            controls,
            ref,
            style,
            isStatic
        ) => {
            const activeComponents = []

            if (!isStatic && drag.test(props)) {
                activeComponents.push(
                    <drag.component
                        {...props}
                        values={values}
                        controls={controls}
                        innerRef={ref}
                    />
                )
            }

            if (!isStatic && gestures.test(props)) {
                activeComponents.push(
                    <gestures.component
                        {...props}
                        values={values}
                        controls={controls}
                        innerRef={ref}
                    />
                )
            }

            activeComponents.push(
                <RenderComponent
                    {...props}
                    values={values}
                    controls={controls}
                    innerRef={ref}
                    style={style}
                    isStatic={isStatic}
                />
            )

            return activeComponents
        },
    }
}
