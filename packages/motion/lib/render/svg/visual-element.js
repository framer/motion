import { __assign } from "tslib";
import { visualElement } from "..";
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-values";
import { htmlConfig } from "../html/visual-element";
import { buildSVGAttrs } from "./utils/build-attrs";
import { camelToDash } from "../dom/utils/camel-to-dash";
import { camelCaseAttributes } from "./utils/camel-case-attrs";
import { isTransformProp } from "../html/utils/transform";
import { renderSVG } from "./utils/render";
import { getDefaultValueType } from "../dom/value-types/defaults";
export var svgVisualElement = visualElement(__assign(__assign({}, htmlConfig), { getBaseTarget: function (props, key) {
        return props[key];
    }, readValueFromInstance: function (domElement, key) {
        var _a;
        if (isTransformProp(key)) {
            return ((_a = getDefaultValueType(key)) === null || _a === void 0 ? void 0 : _a.default) || 0;
        }
        key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
        return domElement.getAttribute(key);
    }, scrapeMotionValuesFromProps: scrapeMotionValuesFromProps, build: function (_element, renderState, latestValues, options, props) {
        buildSVGAttrs(renderState, latestValues, options, props.transformTemplate);
    }, render: renderSVG }));
//# sourceMappingURL=visual-element.js.map