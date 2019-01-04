import { SVGAttributes, ComponentType, ReactHTML, DetailedHTMLFactory } from "react"
import { htmlElements, svgElements, HTMLElements, SVGElements } from "./utils/supported-elements"
import { createMotionComponent } from "./component"
import { ComponentFactory } from "./types"

type UnwrapFactory<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never

export type MotionComponents = { [K in HTMLElements]: ComponentType<UnwrapFactory<ReactHTML[K]>> } &
    { [K in SVGElements]: ComponentType<SVGAttributes<SVGElement>> } & { custom: ComponentFactory }

export const motion: Partial<MotionComponents> = {
    custom: createMotionComponent,
}

htmlElements.forEach(element => (motion[element] = createMotionComponent(element)))
svgElements.forEach(element => (motion[element] = createMotionComponent(element)))
