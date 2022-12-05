import { MotionStyle } from "../../../motion/types"
import { IProjectionNode } from "../../../projection/node/types"
import { camelToDash } from "../../dom/utils/camel-to-dash"
import { renderHTML } from "../../html/utils/render"
import { SVGRenderState } from "../types"
import { camelCaseAttributes } from "./camel-case-attrs"

export function renderSVG(
    element: SVGElement,
    renderState: SVGRenderState,
    _styleProp?: MotionStyle,
    projection?: IProjectionNode
) {
    renderHTML(element as any, renderState, undefined, projection)

    for (const key in renderState.attrs) {
        console.log(key, renderState.attrs)
        element.setAttribute(
            !camelCaseAttributes.has(key) ? camelToDash(key) : key,
            renderState.attrs[key] as string
        )
    }
}
