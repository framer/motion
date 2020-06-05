import * as React from "react"
import { createMotionComponent } from "./component"
import { HTMLMotionComponents, SVGMotionComponents, MotionProps } from "./types"
import { HTMLVisualElement } from "../render/dom/HTMLVisualElement"
import { domConfig } from "../render/dom"

export { MotionContext } from "./context/MotionContext"
export { useExternalRef } from "./utils/use-external-ref"
export { VisualElementAnimationControls } from "../animation/VisualElementAnimationControls"
export { MotionProps }
export { createMotionComponent }

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
function custom<Props>(Component: string | React.ComponentType<Props>) {
    return createMotionComponent<Props, HTMLElement, HTMLVisualElement>(
        Component,
        domConfig
    )
}

type CustomMotionComponent = { custom: typeof custom }
type Motion = HTMLMotionComponents & SVGMotionComponents & CustomMotionComponent

const componentCache = new Map<string, any>()
function getMotionComponent(target: CustomMotionComponent, key: string) {
    if (key === "custom") return target.custom

    if (!componentCache.has(key)) {
        componentCache.set(key, createMotionComponent(key, domConfig))
    }

    return componentCache.get(key)
}

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export const motion = new Proxy(
    { custom },
    { get: getMotionComponent }
) as Motion
