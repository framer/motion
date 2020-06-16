import * as React from "react"
import { MotionComponentConfig, MotionProps } from "../../motion"
import { useDomVisualElement } from "./use-dom-visual-element"
import { render } from "./render"
import { parseDomVariant } from "./utils/parse-dom-variant"
import { createMotionComponent } from "../../motion"
import { HTMLMotionComponents, SVGMotionComponents } from "./types"

/**
 * DOM-specific config for `motion` components
 */
const config: MotionComponentConfig<HTMLElement | SVGElement> = {
    useVisualElement: useDomVisualElement as any,
    render: render as any,
    animationControlsConfig: {
        makeTargetAnimatable: parseDomVariant,
    },
}

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 */
type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

/**
 * Convert any React component into a `motion` component. The provided component
 * **must** use `React.forwardRef` to the underlying DOM component you want to animate.
 *
 * ```jsx
 * const Component = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion.custom(Component)
 * ```
 *
 * @public
 */
function custom<Props>(
    Component: string | React.ComponentType<Props>
): CustomDomComponent<Props> {
    return createMotionComponent(Component, config)
}

type CustomMotionComponent = { custom: typeof custom }
type Motion = HTMLMotionComponents & SVGMotionComponents & CustomMotionComponent

const componentCache = new Map<string, any>()
function get(target: CustomMotionComponent, key: string) {
    if (key === "custom") return target.custom

    if (!componentCache.has(key)) {
        componentCache.set(key, createMotionComponent(key, config))
    }

    return componentCache.get(key)
}

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export const motion = new Proxy({ custom }, { get }) as Motion
