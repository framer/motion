import { __assign } from 'tslib';
import { createElement } from 'react';
import { useHTMLProps } from '../html/use-props.mjs';
import { filterProps } from './utils/filter-props.mjs';
import { isSVGComponent } from './utils/is-svg-component.mjs';
import { useSVGProps } from '../svg/use-props.mjs';

function createUseRender(forwardMotionProps) {
    if (forwardMotionProps === void 0) { forwardMotionProps = false; }
    var useRender = function (Component, props, projectionId, ref, _a, isStatic) {
        var latestValues = _a.latestValues;
        var useVisualProps = isSVGComponent(Component)
            ? useSVGProps
            : useHTMLProps;
        var visualProps = useVisualProps(props, latestValues, isStatic);
        var filteredProps = filterProps(props, typeof Component === "string", forwardMotionProps);
        var elementProps = __assign(__assign(__assign({}, filteredProps), visualProps), { ref: ref });
        if (projectionId) {
            elementProps["data-projection-id"] = projectionId;
        }
        return createElement(Component, elementProps);
    };
    return useRender;
}

export { createUseRender };
