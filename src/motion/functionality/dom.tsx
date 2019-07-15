// TODO: Move this file to `src/dom/`
import * as React from "react"
import { MotionProps } from "../types"
import { createElement, ComponentType, CSSProperties } from "react"
import { buildStyleAttr } from "../utils/use-styles"
import { svgElements } from "../utils/supported-elements"
import { Gestures } from "./gestures"
import { MotionComponentConfig } from "../component"
import { Drag } from "./drag"
import { FunctionalProps } from "./types"
import styler, { buildSVGAttrs } from "stylefire"
import { parseDomVariant } from "../../dom/parse-dom-variant"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { Position } from "./position"

type RenderProps = FunctionalProps & {
    componentProps: MotionProps
    style: CSSProperties
    isStatic: boolean | undefined
}

/**
 * A list of all valid MotionProps
 *
 * @internalremarks
 * This doesn't throw if a `MotionProp` name is missing - it should.
 *
 * @internal
 */
export const _validMotionProps = new Set<keyof MotionProps>([
    "initial",
    "animate",
    "exit",
    "style",
    "variants",
    "transition",
    "transformTemplate",
    "transformValues",
    "custom",
    "inherit",
    "static",
    "positionTransition",
    "onAnimationComplete",
    "onUpdate",
    "onDragStart",
    "onDrag",
    "onDragEnd",
    "onDirectionLock",
    "onDragTransitionEnd",
    "drag",
    "dragConstraints",
    "dragDirectionLock",
    "dragElastic",
    "dragMomentum",
    "dragPropagation",
    "dragTransition",
    "dragOriginX",
    "dragOriginY",
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onPanSessionStart",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "whileHover",
    "whileTap",
    "onHoverEnd",
    "onHoverStart",
])

function stripMotionProps(props: MotionProps) {
    const domProps = {}

    for (const key in props) {
        if (!_validMotionProps.has(key as keyof MotionProps)) {
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
        const forwardProps = isDOM
            ? stripMotionProps(componentProps)
            : componentProps
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
         * The useFunctionalityComponents hook gets used by the `motion` component
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
        useFunctionalityComponents: (
            props,
            values,
            controls,
            ref,
            style,
            isStatic
        ) => {
            const activeComponents: JSX.Element[] = []

            // TODO: Refactor the following loading strategy into something more dynamic
            // This is also a good target for filesize reduction by making these present externally.
            // It might be possible to code-split these out and useState to re-render children when the
            // functionality within becomes available, or Suspense.

            if (!isStatic && Position.shouldRender(props)) {
                activeComponents.push(
                    <Position.component
                        {...props}
                        values={values}
                        controls={controls}
                        innerRef={ref}
                        key="position"
                    />
                )
            }

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
                // API for adding these.
                makeTargetAnimatable: parseDomVariant(values, ref),
            }
        },
    }
}
