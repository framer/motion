import { createHtmlRenderState } from "../../html/utils/create-render-state"
import { zeroDimensions } from "./zero-dimensions"

export const createSvgRenderState = () => ({
    ...createHtmlRenderState(),
    attrs: {},
    dimensions: zeroDimensions,
})
