import { makeUseVisualState } from '../../motion/utils/use-visual-state.mjs';
import { scrapeMotionValuesFromProps } from './utils/scrape-motion-values.mjs';
import { createHtmlRenderState } from './utils/create-render-state.mjs';

var htmlMotionConfig = {
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeMotionValuesFromProps,
        createRenderState: createHtmlRenderState,
    }),
};

export { htmlMotionConfig };
