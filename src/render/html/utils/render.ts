import { HTMLRenderState } from "../types"

export function renderHTML(
    element: HTMLElement,
    { style, vars }: HTMLRenderState
) {
    // Directly assign style into the Element's style prop. In tests Object.assign is the
    // fastest way to assign styles.
    Object.assign(element.style, style)

    // Loop over any CSS variables and assign those.
    for (const key in vars) {
        element.style.setProperty(key, vars[key] as string)
    }
}
