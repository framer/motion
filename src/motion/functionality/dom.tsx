import * as React from "react"
import { MotionProps } from "../types"
import {
    createElement,
    ComponentType,
    CSSProperties,
    ReactElement,
} from "react"
import { buildStyleAttr } from "../utils/use-styles"
import isPropValid from "@emotion/is-prop-valid"
import { svgElements } from "../utils/supported-elements"
import { gestureProps, Gestures } from "./gestures"
import { MotionComponentConfig } from "../component"
import { Drag } from "./drag"
import { FunctionalProps } from "./types"

type RenderProps = FunctionalProps & {
    componentProps: MotionProps
    style: CSSProperties
    isStatic: boolean | undefined
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
        innerRef,
        style,
        values,
        isStatic,
        componentProps,
    }: RenderProps) => {
        const forwardProps = isDOM ? validProps(componentProps) : componentProps

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
            const activeComponents: ReactElement<P>[] = []

            if (!isStatic && Drag.shouldRender(props)) {
                activeComponents.push(
                    <Drag.component
                        {...props}
                        values={values}
                        controls={controls}
                        innerRef={ref}
                        key="drag"
                    />
                )
            }

            if (!isStatic && Gestures.shouldRender(props)) {
                activeComponents.push(
                    <Gestures.component
                        {...props}
                        values={values}
                        controls={controls}
                        innerRef={ref}
                        key="gestures"
                    />
                )
            }

            activeComponents.push(
                <RenderComponent
                    componentProps={props}
                    values={values}
                    controls={controls}
                    innerRef={ref}
                    style={style}
                    isStatic={isStatic}
                    key="renderComponent"
                />
            )

            return activeComponents
        },
    }
}
