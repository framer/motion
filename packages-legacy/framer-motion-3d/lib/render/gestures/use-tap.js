import { useRef } from "react";
import { addPointerEvent, isDragActive, addPointerInfo, pipe, } from "framer-motion";
export function useTap(isStatic, { whileTap, onTapStart, onTap, onTapCancel, onPointerDown, }, visualElement) {
    const isTapEnabled = onTap || onTapStart || onTapCancel || whileTap;
    const isPressing = useRef(false);
    const cancelPointerEndListeners = useRef(null);
    if (isStatic || !visualElement || !isTapEnabled)
        return {};
    function removePointerEndListener() {
        var _a;
        (_a = cancelPointerEndListeners.current) === null || _a === void 0 ? void 0 : _a.call(cancelPointerEndListeners);
        cancelPointerEndListeners.current = null;
    }
    function checkPointerEnd() {
        var _a;
        removePointerEndListener();
        isPressing.current = false;
        (_a = visualElement.animationState) === null || _a === void 0 ? void 0 : _a.setActive("whileTap", false);
        return !isDragActive();
    }
    function onPointerUp(event, info) {
        if (!checkPointerEnd())
            return;
        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        onTap === null || onTap === void 0 ? void 0 : onTap(event, info);
    }
    function onPointerCancel(event, info) {
        if (!checkPointerEnd())
            return;
        onTapCancel === null || onTapCancel === void 0 ? void 0 : onTapCancel(event, info);
    }
    return {
        onPointerDown: addPointerInfo((event, info) => {
            var _a;
            removePointerEndListener();
            if (isPressing.current)
                return;
            isPressing.current = true;
            /**
             * Only set listener to passive if there are no external listeners.
             */
            const options = {
                passive: !(onTapStart || onTap || onTapCancel || onPointerDown),
            };
            cancelPointerEndListeners.current = pipe(addPointerEvent(window, "pointerup", onPointerUp, options), addPointerEvent(window, "pointercancel", onPointerCancel, options));
            (_a = visualElement.animationState) === null || _a === void 0 ? void 0 : _a.setActive("whileTap", true);
            onPointerDown === null || onPointerDown === void 0 ? void 0 : onPointerDown(event);
            onTapStart === null || onTapStart === void 0 ? void 0 : onTapStart(event, info);
        }),
    };
}
//# sourceMappingURL=use-tap.js.map