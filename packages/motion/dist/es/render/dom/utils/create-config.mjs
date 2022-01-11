import { __assign } from 'tslib';
import { isSVGComponent } from './is-svg-component.mjs';
import { createUseRender } from '../use-render.mjs';
import { svgMotionConfig } from '../../svg/config-motion.mjs';
import { htmlMotionConfig } from '../../html/config-motion.mjs';

function createDomMotionConfig(Component, _a, preloadedFeatures, createVisualElement, projectionNodeConstructor) {
    var _b = _a.forwardMotionProps, forwardMotionProps = _b === void 0 ? false : _b;
    var baseConfig = isSVGComponent(Component)
        ? svgMotionConfig
        : htmlMotionConfig;
    return __assign(__assign({}, baseConfig), { preloadedFeatures: preloadedFeatures, useRender: createUseRender(forwardMotionProps), createVisualElement: createVisualElement, projectionNodeConstructor: projectionNodeConstructor, Component: Component });
}

export { createDomMotionConfig };
