import { HTMLProps, SVGProps, ComponentType } from "react"
import { createMotionComponent } from "./component"
import { htmlElements, svgElements } from "./supported-elements"
import { ComponentFactory, MotionProps } from "./types"

export type Motion = {
    (component: ComponentType): ComponentFactory<HTMLProps<any> | SVGProps<any>>
    [key: string]: ComponentFactory<(HTMLProps<any> | SVGProps<any>) & MotionProps>
}

export const motion: Motion = createMotionComponent as Motion

htmlElements.forEach(element => (motion[element] = createMotionComponent(element)))
svgElements.forEach(element => (motion[element] = createMotionComponent(element)))
