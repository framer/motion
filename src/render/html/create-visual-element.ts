import { MotionComponentConfig } from "../../motion"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { VisualElementOptions } from "../types"
import { HTMLRenderState } from "./types"
import { htmlVisualElement } from "./visual-element"
import { scrapeMotionValuesFromProps as scrapeHTMLProps } from "./utils/scrape-motion-values"
import { createHtmlRenderState } from "./utils/create-render-state"

export function createHTMLVisualElement(
    isStatic: boolean = false,
    options: VisualElementOptions<HTMLElement>
) {
    return htmlVisualElement(options, { enableHardwareAcceleration: !isStatic })
}

export const htmlMotionConfig: Partial<MotionComponentConfig<
    HTMLElement,
    HTMLRenderState
>> = {
    createVisualElement: createHTMLVisualElement,
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeHTMLProps,
        createRenderState: createHtmlRenderState,
    }),
}
