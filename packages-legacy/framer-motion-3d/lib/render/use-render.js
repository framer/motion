import { createElement, useMemo } from "react";
import { filterProps, isMotionValue, resolveMotionValue, } from "framer-motion";
import { useHover } from "./gestures/use-hover";
import { useTap } from "./gestures/use-tap";
export const useRender = (Component, props, ref, _state, isStatic, visualElement) => {
    const visualProps = useVisualProps(props);
    /**
     * If isStatic, render motion values as props
     * If !isStatic, render motion values as props on initial render
     */
    return createElement(Component, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ ref }, filterProps(props, false, false)), visualProps), { onUpdate: props.onInstanceUpdate }), useHover(isStatic, props, visualElement)), useTap(isStatic, props, visualElement)));
};
function useVisualProps(props) {
    return useMemo(() => {
        const visualProps = {};
        for (const key in props) {
            const prop = props[key];
            if (isMotionValue(prop)) {
                visualProps[key] = prop.get();
            }
            else if (Array.isArray(prop) && prop.includes(isMotionValue)) {
                visualProps[key] = prop.map(resolveMotionValue);
            }
        }
        return visualProps;
    }, []);
}
//# sourceMappingURL=use-render.js.map