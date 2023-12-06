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

    if (element.dataset.framerAppearId === "smxowt") {
        console.log(style.opacity, projectionStyles?.opacity)

        console.log("computed opacity", getComputedStyle(element).opacity)
    }

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
