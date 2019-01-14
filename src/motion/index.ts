import { ComponentType, ReactHTML, SVGAttributes, DetailedHTMLFactory } from "react"
import { elements, HTMLElements, SVGElements } from "./utils/supported-elements"
export { MotionContext } from "./utils/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { AnimationControls } from "./utils/use-animation-controls"
import { MotionProps } from "./types"
import { createMotionComponent } from "./component"

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type UnwrapFactory<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never

export type HTMLMotionComponents = {
    [K in HTMLElements]: ComponentType<Omit<UnwrapFactory<ReactHTML[K]>, "style"> & MotionProps>
}
export type SVGMotionComponents = {
    [K in SVGElements]: ComponentType<Omit<SVGAttributes<SVGElement>, "style"> & MotionProps>
}
export type CustomMotionComponent = { custom: typeof createMotionComponent }

export type MotionComponents = CustomMotionComponent & HTMLMotionComponents & SVGMotionComponents

export const motion = elements.reduce(
    (acc, element) => {
        acc[element] = createMotionComponent(element)
        return acc
    },
    { custom: createMotionComponent }
) as MotionComponents
