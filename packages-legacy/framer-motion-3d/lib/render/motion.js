import { createMotionComponent, animations, makeUseVisualState, } from "framer-motion";
import { useRender } from "./use-render";
import { createVisualElement, createRenderState } from "./create-visual-element";
import { scrapeMotionValuesFromProps } from "./utils/scrape-motion-value";
const useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps,
    createRenderState,
});
const preloadedFeatures = Object.assign({}, animations);
function custom(Component) {
    return createMotionComponent({
        Component,
        preloadedFeatures,
        useRender,
        useVisualState,
        createVisualElement,
    });
}
const componentCache = new Map();
export const motion = new Proxy(custom, {
    get: (_, key) => {
        !componentCache.has(key) && componentCache.set(key, custom(key));
        return componentCache.get(key);
    },
});
//# sourceMappingURL=motion.js.map