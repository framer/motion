import { MotionStyle } from "../../.."
import { IProjectionNode } from "../../../projection/node/types"
import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState,
    styleProp?: MotionStyle,
    projection?: IProjectionNode
) {
    const projectionStyles =
        projection && projection.getProjectionStyles(styleProp)
    Object.assign(element.style, style, projectionStyles)

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
