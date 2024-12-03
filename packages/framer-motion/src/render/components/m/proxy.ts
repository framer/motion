import { createDOMMotionComponentProxy } from "../create-proxy"
import { createMinimalMotionComponent } from "./create"

export const m = /*@__PURE__*/ createDOMMotionComponentProxy(
    createMinimalMotionComponent
)
