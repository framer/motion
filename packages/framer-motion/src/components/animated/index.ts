import { motionOne } from "../../render/dom/features-motion-one"
import { createMotionProxy } from "../../render/dom/motion-proxy"
import { createDomMotionConfig } from "../../render/dom/utils/create-config"
import { MotionOneVisualElement } from "../../render/waapi/MotionOneVisualElement"

export const motionone = /*@__PURE__*/ createMotionProxy(
    (Component, config) =>
        createDomMotionConfig(
            Component,
            config,
            motionOne,
            (_, options) => new MotionOneVisualElement(options as any) as any
        ) as any
)
