import { MotionComponentConfig } from "../../motion"
import { makeUseVisualState } from "../../motion/utils/use-visual-state"
import { HTMLRenderState } from "./types"
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values"
import { createHtmlRenderState } from "./utils/create-render-state"

export const htmlMotionConfig: Partial<
    MotionComponentConfig<HTMLElement, HTMLRenderState>
> = {
    useVisualState: makeUseVisualState({
        applyWillChange: true,
        scrapeMotionValuesFromProps,
        createRenderState: createHtmlRenderState,
    }),
}
