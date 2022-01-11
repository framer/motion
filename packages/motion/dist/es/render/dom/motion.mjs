import { __assign } from 'tslib';
import { createMotionComponent } from '../../motion/index.mjs';
import { createMotionProxy } from './motion-proxy.mjs';
import { createDomMotionConfig } from './utils/create-config.mjs';
import { gestureAnimations } from '../../motion/features/gestures.mjs';
import { animations } from '../../motion/features/animations.mjs';
import { drag } from '../../motion/features/drag.mjs';
import { createDomVisualElement } from './create-visual-element.mjs';
import { layoutFeatures } from '../../motion/features/layout/index.mjs';
import { HTMLProjectionNode } from '../../projection/node/HTMLProjectionNode.mjs';

var featureBundle = __assign(__assign(__assign(__assign({}, animations), gestureAnimations), drag), layoutFeatures);
/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
var motion = /*@__PURE__*/ createMotionProxy(function (Component, config) {
    return createDomMotionConfig(Component, config, featureBundle, createDomVisualElement, HTMLProjectionNode);
});
/**
 * Create a DOM `motion` component with the provided string. This is primarily intended
 * as a full alternative to `motion` for consumers who have to support environments that don't
 * support `Proxy`.
 *
 * ```javascript
 * import { createDomMotionComponent } from "framer-motion"
 *
 * const motion = {
 *   div: createDomMotionComponent('div')
 * }
 * ```
 *
 * @public
 */
function createDomMotionComponent(key) {
    return createMotionComponent(createDomMotionConfig(key, { forwardMotionProps: false }, featureBundle, createDomVisualElement, HTMLProjectionNode));
}

export { createDomMotionComponent, motion };
