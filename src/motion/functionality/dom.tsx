// TODO: Move this file to `src/dom/`
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
import styler from "stylefire"
import { parseDomVariant } from "../../dom/parse-dom-variant"

type RenderProps = FunctionalProps & {
    componentProps: MotionProps
    style: CSSProperties
    isStatic: boolean | undefined
}

/**
 * Maintain a list of event handlers. Emotion's `is-prop-valid` doesn't whitelist every event
 * handler, it just pattern-matches `onX`. So we can manually strip out ours.
 */
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

/**
 * Returns an object of only valid props. We remove invalid DOM props according to
 * Emotion's `isPropValid`, and any of our own event handlers. This was necessary when
 * we passed all a component's props through to dynamic variant resolvers, but since
 * moving that logic to custom it's possible for us to ditch this and save some filesize/performance
 * by simply destructuring out the props that we use.
 */
const validProps = (props: MotionProps) => {
    const valid = {}

    for (const key in props) {
        if (isPropValid(key) && !eventHandlers.has(key)) {
            valid[key] = props[key]
        }
    }

    return valid
}

/**
 * @internal
 */
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
        getValueControlsConfig(ref, values) {
            return {
                values,
                readValueFromSource: key =>
                    styler(ref.current as Element).get(key),
                makeTargetAnimatable: parseDomVariant(values, ref),
            }
        },
    }
}
