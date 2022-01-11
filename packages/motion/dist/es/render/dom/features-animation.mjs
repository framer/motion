import { __assign } from 'tslib';
import { animations } from '../../motion/features/animations.mjs';
import { gestureAnimations } from '../../motion/features/gestures.mjs';
import { createDomVisualElement } from './create-visual-element.mjs';

/**
 * @public
 */
var domAnimation = __assign(__assign({ renderer: createDomVisualElement }, animations), gestureAnimations);

export { domAnimation };
