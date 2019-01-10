import { elements, HTMLElements, SVGElements } from "./utils/supported-elements"
import { createMotionComponent } from "./component"
import { ComponentType, ReactHTML, SVGAttributes, HTMLAttributes } from "react"
import { MotionProps } from "./types"

export type HTMLMotionComponents = { [K in HTMLElements]: ComponentType<HTMLAttributes<ReactHTML[K]> & MotionProps> }
export type SVGMotionComponents = { [K in SVGElements]: ComponentType<SVGAttributes<SVGElement> & MotionProps> }
export type CustomMotionComponent = { custom: typeof createMotionComponent }

export type MotionComponents = CustomMotionComponent & HTMLMotionComponents & SVGMotionComponents

export const motion = elements.reduce(
    (acc, element) => {
        acc[element] = createMotionComponent(element)
        return acc
    },
    { custom: createMotionComponent }
) as MotionComponents
