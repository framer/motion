import { renderSVG } from "./utils/render";
import { scrapeMotionValuesFromProps as scrapeSVGProps } from "./utils/scrape-motion-values";
import { makeUseVisualState } from "../../motion/utils/use-visual-state";
import { createSvgRenderState } from "./utils/create-render-state";
import { buildSVGAttrs } from "./utils/build-attrs";
export var svgMotionConfig = {
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeSVGProps,
        createRenderState: createSvgRenderState,
        onMount: function (props, instance, _a) {
            var renderState = _a.renderState, latestValues = _a.latestValues;
            try {
                renderState.dimensions =
                    typeof instance.getBBox ===
                        "function"
                        ? instance.getBBox()
                        : instance.getBoundingClientRect();
            }
            catch (e) {
                // Most likely trying to measure an unrendered element under Firefox
                renderState.dimensions = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                };
            }
            buildSVGAttrs(renderState, latestValues, { enableHardwareAcceleration: false }, props.transformTemplate);
            // TODO: Replace with direct assignment
            renderSVG(instance, renderState);
        },
    }),
};
//# sourceMappingURL=config-motion.js.map