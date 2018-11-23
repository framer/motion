import { HTMLProps, SVGProps, ComponentType } from "react"
import { createMotionComponent } from "./component"
import { htmlElements, svgElements, HTMLElements, SVGElements } from "./supported-elements"
import { ComponentFactory } from "./types"

export type Motion = {
    <P>(component: ComponentType<P>): ComponentFactory<P>
} & { [K in HTMLElements]: ComponentFactory<HTMLProps<Element>> } &
    { [K in SVGElements]: ComponentFactory<SVGProps<Element>> }

export const motion: Motion = createMotionComponent as Motion

htmlElements.forEach(element => (motion[element] = createMotionComponent(element)))
svgElements.forEach(element => (motion[element] = createMotionComponent(element)))
