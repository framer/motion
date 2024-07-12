import { MotionStyle } from "../../.."
import { IProjectionNode } from "../../../projection/node/types"
import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState,
    styleProp?: MotionStyle,
    projection?: IProjectionNode
) {
    for (const key in style) {
        element.style[key] = style[key]
    }

    if (projection) {
        const projectionStyles = projection.getProjectionStyles(styleProp)
        for (const key in projectionStyles) {
            element.style.setProperty(key, projectionStyles[key] as string)
        }
    }

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
