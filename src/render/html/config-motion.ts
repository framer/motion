import { MotionComponentConfig } from "../../motion"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { HTMLRenderState } from "./types"
import { scrapeMotionValuesFromProps as scrapeHTMLProps } from "./utils/scrape-motion-values"
import { createHtmlRenderState } from "./utils/create-render-state"

export const htmlMotionConfig: Partial<MotionComponentConfig<
    HTMLElement,
    HTMLRenderState
>> = {
    // createVisualElement: (options) =>
    //     htmlVisualElement(options, { enableHardwareAcceleration: true }),
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeHTMLProps,
        createRenderState: createHtmlRenderState,
    }),
}
