import { createDOMMotionComponentProxy } from "../create-proxy"
import { createMotionComponent } from "./create"

export const motion = /*@__PURE__*/ createDOMMotionComponentProxy(
    createMotionComponent
)
