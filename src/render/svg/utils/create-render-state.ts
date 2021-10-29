import { createHtmlRenderState } from "../../html/utils/create-render-state"
import { SVGRenderState } from "../types"

export const createSvgRenderState = (): SVGRenderState => ({
    ...createHtmlRenderState(),
    attrs: {},
})
