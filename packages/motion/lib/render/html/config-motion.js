import { makeUseVisualState } from "../../motion/utils/use-visual-state";
import { scrapeMotionValuesFromProps as scrapeHTMLProps } from "./utils/scrape-motion-values";
import { createHtmlRenderState } from "./utils/create-render-state";
export var htmlMotionConfig = {
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeHTMLProps,
        createRenderState: createHtmlRenderState,
    }),
};
//# sourceMappingURL=config-motion.js.map