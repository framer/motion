import { useContext, useEffect, useRef } from "react";
import { PresenceContext } from "../../context/PresenceContext";
import { useVisualElementContext } from "../../context/MotionContext";
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect";
import { LazyContext } from "../../context/LazyContext";
export function useVisualElement(Component, visualState, props, createVisualElement) {
    var lazyContext = useContext(LazyContext);
    var parent = useVisualElementContext();
    var presenceContext = useContext(PresenceContext);
    var visualElementRef = useRef(undefined);
    /**
     * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
     */
    if (!createVisualElement)
        createVisualElement = lazyContext.renderer;
    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState: visualState,
            parent: parent,
            props: props,
            presenceId: presenceContext === null || presenceContext === void 0 ? void 0 : presenceContext.id,
            blockInitialAnimation: (presenceContext === null || presenceContext === void 0 ? void 0 : presenceContext.initial) === false,
        });
    }
    var visualElement = visualElementRef.current;
    useIsomorphicLayoutEffect(function () {
        visualElement === null || visualElement === void 0 ? void 0 : visualElement.syncRender();
    });
    useEffect(function () {
        var _a;
        (_a = visualElement === null || visualElement === void 0 ? void 0 : visualElement.animationState) === null || _a === void 0 ? void 0 : _a.animateChanges();
    });
    useIsomorphicLayoutEffect(function () { return function () { return visualElement === null || visualElement === void 0 ? void 0 : visualElement.notifyUnmount(); }; }, []);
    return visualElement;
}
//# sourceMappingURL=use-visual-element.js.map