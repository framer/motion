import { __assign } from 'tslib';
import { useMemo } from 'react';
import { copyRawValuesOnly } from '../html/use-props.mjs';
import { buildSVGAttrs } from './utils/build-attrs.mjs';
import { createSvgRenderState } from './utils/create-render-state.mjs';

function useSVGProps(props, visualState) {
    var visualProps = useMemo(function () {
        var state = createSvgRenderState();
        buildSVGAttrs(state, visualState, { enableHardwareAcceleration: false }, props.transformTemplate);
        return __assign(__assign({}, state.attrs), { style: __assign({}, state.style) });
    }, [visualState]);
    if (props.style) {
        var rawStyles = {};
        copyRawValuesOnly(rawStyles, props.style, props);
        visualProps.style = __assign(__assign({}, rawStyles), visualProps.style);
    }
    return visualProps;
}

export { useSVGProps };
