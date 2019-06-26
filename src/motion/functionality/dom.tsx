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
import styler, { buildSVGAttrs } from "stylefire"
import { parseDomVariant } from "../../dom/parse-dom-variant"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { resolveCurrent } from "../../value/utils/resolve-values"

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

const buildSVGProps = (values: MotionValuesMap, style: CSSProperties) => {
    const motionValueStyles: { [key: string]: any } = resolveCurrent(values)
    const attrs = buildSVGAttrs(motionValueStyles as {
        [key: string]: string | number
    })
    attrs.style = { ...style, ...attrs.style } as any

    return attrs
}

/**
 * Create a configuration for `motion` components that provides DOM-specific functionality.
 *
 * @internal
 */
export function createDomMotionConfig<P>(
    Component: string | ComponentType<P>
): MotionComponentConfig {
    const isDOM = typeof Component === "string"
    const isSVG = isDOM && svgElements.indexOf(Component as any) !== -1

    /**
     * Create a component that renders the DOM element. This step of indirection
     * could probably be removed at this point, and `createElement` could be moved
     * to the `activeComponents.push`.
     */
    const RenderComponent = ({
        innerRef,
        style,
        values,
        isStatic,
        componentProps,
    }: RenderProps) => {
        const forwardProps = isDOM ? validProps(componentProps) : componentProps
        const staticVisualStyles = isSVG
            ? buildSVGProps(values, style)
            : { style: buildStyleAttr(values, style, isStatic) }

        return createElement<any>(Component, {
            ...forwardProps,
            ref: innerRef,
            ...staticVisualStyles,
        })
    }

    return {
        /**
         * This hook gets used by the `motion` component
         *
         * Each functionality component gets provided the `ref`, animation controls and the `MotionValuesMap`
         * generated for that component, as well as all the `props` passed to it by the user.
         *
         * The pattern used to determine whether to load and use each piece of functionality is
         * consistent (should render? Then push component) and could be used to extend functionality.
         *
         * By exposing a mutable piece of memory via an API like `extendMotionComponent` we could
         * allow users to add `FunctionalComponentDefinition`s. This would allow us to offer file size
         * reductions by shipping an entry point that doesn't load gesture and drag functionality, and
         * also offer a way for users to develop plugins/other functionality.
         *
         * For user-defined functionality we'd need to allow
         *  1) User-defined prop typing (extending `P`)
         *  2) User-defined "clean props" that removes their plugin's props before being passed to the DOM.
         */
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
                // TODO: This is a good second source of plugins. This function contains the CSS variable
                // and unit conversion support. These functions share a common signature. We could make another
                // API for adding these and extend to support stuff like FLIP
                makeTargetAnimatable: parseDomVariant(values, ref),
            }
        },
    }
}
