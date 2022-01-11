import { htmlVisualElement } from "../html/visual-element";
import { svgVisualElement } from "../svg/visual-element";
import { isSVGComponent } from "./utils/is-svg-component";
export var createDomVisualElement = function (Component, options) {
    return isSVGComponent(Component)
        ? svgVisualElement(options, { enableHardwareAcceleration: false })
        : htmlVisualElement(options, { enableHardwareAcceleration: true });
};
//# sourceMappingURL=create-visual-element.js.map