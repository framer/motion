import { SVGAttributes, ComponentType, ReactHTML, DetailedHTMLFactory } from "react"
import { createMotionComponent } from "./component"
import { htmlElements, svgElements, HTMLElements, SVGElements } from "./supported-elements"
import { ComponentFactory } from "./types"

type UnwrapFactory<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never

export type Motion = {
    <P>(component: ComponentType<P>): ComponentFactory<P>
} & { [K in HTMLElements]: ComponentFactory<UnwrapFactory<ReactHTML[K]>> } &
    { [K in SVGElements]: ComponentFactory<SVGAttributes<SVGElement>> }

export const motion: Motion = createMotionComponent as Motion

htmlElements.forEach(element => (motion[element] = createMotionComponent(element)))
svgElements.forEach(element => (motion[element] = createMotionComponent(element)))
