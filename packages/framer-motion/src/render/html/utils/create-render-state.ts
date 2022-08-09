import { WillChangeManager } from "./will-change"

export const createHtmlRenderState = () => ({
    style: {},
    transform: {},
    transformKeys: [],
    transformOrigin: {},
    vars: {},
    willChange: new WillChangeManager(),
})
