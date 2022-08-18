import { HTMLMotionComponents } from "../../render/html/types"
import { SVGMotionComponents } from "../../render/svg/types"
import { createMotionComponent } from "./component"

export type DOMMotionComponents = HTMLMotionComponents & SVGMotionComponents

const componentCache = new Map<string, any>()

export const motion = new Proxy(createMotionComponent, {
    get: (_, key: string) => {
        if (!componentCache.has(key)) {
            componentCache.set(key, createMotionComponent(key))
        }

        return componentCache.get(key)!
    },
}) as typeof createMotionComponent & DOMMotionComponents
