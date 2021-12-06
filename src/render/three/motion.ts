import { createMotionComponent } from "../../motion"
import { animations } from "../../motion/features/animations"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { useRender } from "./use-render"
import type { ThreeRenderState, ThreeMotionComponents } from "./types"
import { createVisualElement, createRenderState } from "./create-visual-element"
import { FeatureBundle } from "../.."
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-value"

const useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps,
    createRenderState,
})

const preloadedFeatures: Partial<FeatureBundle> = {
    ...animations,
}

function custom<Props>(Component: string) {
    return createMotionComponent<Props, any, ThreeRenderState>({
        Component,
        preloadedFeatures,
        useRender,
        useVisualState,
        createVisualElement,
    } as any)
}

const componentCache = new Map<string, any>()
export const motion = new Proxy(custom, {
    get: (_, key: string) => {
        !componentCache.has(key) && componentCache.set(key, custom(key))

        return componentCache.get(key)!
    },
}) as typeof custom & ThreeMotionComponents
