import { createHtmlRenderState } from "./create-html-render-state"
import { zeroDimensions } from "./zero-dimensions"

export const createSvgRenderState = () => ({
    ...createHtmlRenderState(),
    attrs: {},
    dimensions: zeroDimensions,
})
