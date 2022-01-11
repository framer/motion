import { __assign } from 'tslib';
import { createHtmlRenderState } from '../../html/utils/create-render-state.mjs';

var createSvgRenderState = function () { return (__assign(__assign({}, createHtmlRenderState()), { attrs: {} })); };

export { createSvgRenderState };
