import { camelToDash } from "../../dom/utils/camel-to-dash"
import { renderHTML } from "../../html/utils/render"
import { SVGRenderState } from "../types"
import { camelCaseAttributes } from "./camel-case-attrs"
import { MotionStyle } from "../../.."
import { IProjectionNode } from "../../../projection/node/types"

export function renderSVG(
    element: SVGElement,
    renderState: SVGRenderState,
    styleProp?: MotionStyle,
    projection?: IProjectionNode
) {
    renderHTML(element as any, renderState, styleProp, projection)

    for (const key in renderState.attrs) {
        element.setAttribute(
            !camelCaseAttributes.has(key) ? camelToDash(key) : key,
            renderState.attrs[key] as string
        )
    }
}
