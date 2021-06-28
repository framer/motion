import { IProjectionNode } from "../../../projection/node/types"
import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState,
    projection?: IProjectionNode
) {
    // Directly assign style into the Element's style prop. In tests Object.assign is the
    // fastest way to assign styles.
    // TODO: Is there any perf problem in assigning projection has a second step here?
    if (projection) {
        Object.assign(element.style, style, projection.getProjectionStyles())
    } else {
        Object.assign(element.style, style)
    }

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
