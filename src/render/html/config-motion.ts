import { MotionComponentConfig } from "../../motion"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { HTMLRenderState } from "./types"
import { scrapeMotionValuesFromProps as scrapeHTMLProps } from "./utils/scrape-motion-values"
import { createHtmlRenderState } from "./utils/create-render-state"
import { htmlVisualElement } from "./visual-element"

export const htmlMotionConfig: Partial<MotionComponentConfig<
    HTMLElement,
    HTMLRenderState
>> = {
    createVisualElement: (isStatic, options) =>
        htmlVisualElement(options, { enableHardwareAcceleration: !isStatic }),
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeHTMLProps,
        createRenderState: createHtmlRenderState,
    }),
}
