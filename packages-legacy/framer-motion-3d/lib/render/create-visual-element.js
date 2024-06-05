import { createBox, VisualElement } from "framer-motion";
import { setThreeValue } from "./utils/set-value";
import { readThreeValue } from "./utils/read-value";
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-value";
export const createRenderState = () => ({});
export class ThreeVisualElement extends VisualElement {
    constructor() {
        super(...arguments);
        this.type = "three";
    }
    readValueFromInstance(instance, key) {
        return readThreeValue(instance, key);
    }
    getBaseTargetFromProps() {
        return undefined;
    }
    sortInstanceNodePosition(a, b) {
        return a.id - b.id;
    }
    removeValueFromRenderState() { }
    measureInstanceViewportBox() {
        return createBox();
    }
    scrapeMotionValuesFromProps(props, prevProps) {
        return scrapeMotionValuesFromProps(props, prevProps);
    }
    build(state, latestValues) {
        for (const key in latestValues) {
            state[key] = latestValues[key];
        }
    }
    renderInstance(instance, renderState) {
        for (const key in renderState) {
            setThreeValue(instance, key, renderState);
        }
    }
}
export const createVisualElement = (_, options) => new ThreeVisualElement(options, {});
//# sourceMappingURL=create-visual-element.js.map