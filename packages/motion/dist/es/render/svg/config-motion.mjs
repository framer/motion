import { renderSVG } from './utils/render.mjs';
import { scrapeMotionValuesFromProps } from './utils/scrape-motion-values.mjs';
import { makeUseVisualState } from '../../motion/utils/use-visual-state.mjs';
import { createSvgRenderState } from './utils/create-render-state.mjs';
import { buildSVGAttrs } from './utils/build-attrs.mjs';

var svgMotionConfig = {
    useVisualState: makeUseVisualState({
        scrapeMotionValuesFromProps: scrapeMotionValuesFromProps,
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

export { svgMotionConfig };
