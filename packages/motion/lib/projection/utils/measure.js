import { convertBoundingBoxToBox, transformBoxPoints, } from "../geometry/conversion";
import { translateAxis } from "../geometry/delta-apply";
export function measureViewportBox(instance, transformPoint) {
    return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint));
}
export function measurePageBox(element, rootProjectionNode, transformPagePoint) {
    var viewportBox = measureViewportBox(element, transformPagePoint);
    var scroll = rootProjectionNode.scroll;
    if (scroll) {
        translateAxis(viewportBox.x, scroll.x);
        translateAxis(viewportBox.y, scroll.y);
    }
    return viewportBox;
}
//# sourceMappingURL=measure.js.map