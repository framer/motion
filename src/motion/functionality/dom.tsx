// TODO: Move this file to `src/dom/`
import * as React from "react"
import { MotionProps } from "../types"
import { createElement, ComponentType, CSSProperties } from "react"
import { buildStyleAttr } from "../utils/use-styles"
import { svgElements } from "../utils/supported-elements"
import { Gestures } from "./gestures"
import { MotionComponentConfig } from "../component"
import { Drag } from "./drag"
import styler, { buildSVGAttrs } from "stylefire"
import { parseDomVariant } from "../../dom/parse-dom-variant"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { Position } from "./position"
import { isValidMotionProp } from "../utils/valid-prop"
import { getAnimationComponent } from "./animation"

function stripMotionProps(props: MotionProps) {
    const domProps = {}

    for (const key in props) {
        if (!isValidMotionProp(key)) {
            domProps[key] = props[key]
        }
    }

    return domProps
}

const buildSVGProps = (values: MotionValuesMap, style: CSSProperties) => {
    const motionValueStyles = resolveCurrent(values)
    const props = buildSVGAttrs(motionValueStyles)
    props.style = { ...style, ...props.style } as any
    return props
}

const functionalityComponents = [Position, Drag, Gestures]
const numFunctionalityComponents = functionalityComponents.length

/**
 * Create a configuration for `motion` components that provides DOM-specific functionality.
 *
 * @internal
 */
export function createDomMotionConfig<P = MotionProps>(
    Component: string | ComponentType<P>
): MotionComponentConfig {
    const isDOM = typeof Component === "string"
    const isSVG = isDOM && svgElements.indexOf(Component as any) !== -1

    return {
        renderComponent: (ref, style, values, props, isStatic) => {
            const forwardProps = isDOM ? stripMotionProps(props) : props
            const staticVisualStyles = isSVG
                ? buildSVGProps(values, style)
                : { style: buildStyleAttr(values, style, isStatic) }

            return createElement<any>(Component, {
                ...forwardProps,
                ref,
                ...staticVisualStyles,
            })
        },

        /**
         * loadFunctionalityComponents gets used by the `motion` component
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
         * also offer a way for users to develop plugins/other functionality. Because these functionalities
         * are loaded as components, we can look into using Suspense for this purpose.
         *
         * For user-defined functionality we'd need to allow
         *  1) User-defined prop typing (extending `P`)
         *  2) User-defined "clean props" function that removes their plugin's props before being passed to the DOM.
         */
        loadFunctionalityComponents: (
            ref,
            values,
            props,
            controls,
            inherit
        ) => {
            const activeComponents: JSX.Element[] = []

            // TODO: Consolidate Animation functionality loading strategy with other functionality components
            const Animation = getAnimationComponent(props)

            if (Animation) {
                activeComponents.push(
                    <Animation
                        key="animation"
                        initial={props.initial}
                        animate={props.animate}
                        variants={props.variants}
                        transition={props.transition}
                        controls={controls}
                        inherit={inherit}
                        values={values}
                    />
                )
            }

            for (let i = 0; i < numFunctionalityComponents; i++) {
                const {
                    shouldRender,
                    key,
                    Component,
                } = functionalityComponents[i]

                if (shouldRender(props)) {
                    activeComponents.push(
                        <Component
                            key={key}
                            {...props}
                            values={values}
                            controls={controls}
                            innerRef={ref}
                        />
                    )
                }
            }

            return activeComponents
        },
        getValueControlsConfig(ref, values) {
            return {
                values,
                readValueFromSource: key =>
                    styler(ref.current as Element).get(key),
                // TODO: This is a good second source of plugins. This function contains the CSS variable
                // and unit conversion support. These functions share a common signature. We could make another
                // API for adding these.
                makeTargetAnimatable: parseDomVariant(values, ref),
            }
        },
    }
}
