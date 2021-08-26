import { IProjectionNode } from "../../../projection/node/types"
import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState,
    projection?: IProjectionNode
) {
    Object.assign(
        element.style,
        style,
        projection ? projection.getProjectionStyles() : {}
    )
    element.id === "item-child" &&
        console.log(
            style.opacity,
            projection && projection.getProjectionStyles().opacity
        )
    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
