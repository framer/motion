import { VisualElement } from "."
import { MotionProps } from "../../motion/types"
import { Ref } from "react"

/**
 * A generic function type that will return a specific VisualElement,
 * for instance useDomVisualElement will return either an SVGVisualElement
 * or a HTMLVisualElement.
 */
export type UseVisualElement<E, P = MotionProps> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps & P,
    isStatic?: boolean,
    ref?: Ref<E>
) => VisualElement

/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number
}

/**
 * Base config for all VisualElements
 */
export interface VisualElementConfig {
    /**
     * Optional, will be called once per frame on update if provided via props.
     */
    onUpdate?: MotionProps["onUpdate"]
}
