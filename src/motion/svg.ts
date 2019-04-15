import {
    SVGAttributes,
    ForwardRefExoticComponent,
    RefAttributes,
    PropsWithoutRef,
} from "react"
import { svgElements, SVGElements } from "./utils/supported-elements"
import { createMotionComponent } from "../motion"
import { createDomMotionConfig } from "./functionality/dom"
import { MotionProps } from "./types"

interface SVGAttributesWithoutMotionProps
    extends Pick<
        SVGAttributes<SVGElement>,
        Exclude<keyof SVGAttributes<SVGElement>, keyof MotionProps>
    > {}
/**
 * @public
 */
export interface SVGMotionProps
    extends SVGAttributesWithoutMotionProps,
        MotionProps {}

type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
    PropsWithoutRef<P> & RefAttributes<T>
>

/**
 * Motion-optimised versions of React's SVG components.
 *
 * @public
 */
export type SVGMotionComponents = {
    [K in SVGElements]: ForwardRefComponent<SVGElement, SVGMotionProps>
}

export const svgMotionComponents: SVGMotionComponents = svgElements.reduce(
    (acc, Component) => {
        acc[Component] = createMotionComponent(createDomMotionConfig(Component))
        return acc
    },
    {} as SVGMotionComponents
)
