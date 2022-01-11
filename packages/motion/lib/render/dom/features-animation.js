import { __assign } from "tslib";
import { animations } from "../../motion/features/animations";
import { gestureAnimations } from "../../motion/features/gestures";
import { createDomVisualElement } from "./create-visual-element";
/**
 * @public
 */
export var domAnimation = __assign(__assign({ renderer: createDomVisualElement }, animations), gestureAnimations);
//# sourceMappingURL=features-animation.js.map