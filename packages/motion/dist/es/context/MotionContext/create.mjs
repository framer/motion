import { useMemo, useContext } from 'react';
import { MotionContext } from './index.mjs';
import { getCurrentTreeVariants } from './utils.mjs';

function useCreateMotionContext(props) {
    var _a = getCurrentTreeVariants(props, useContext(MotionContext)), initial = _a.initial, animate = _a.animate;
    return useMemo(function () { return ({ initial: initial, animate: animate }); }, [variantLabelsAsDependency(initial), variantLabelsAsDependency(animate)]);
}
function variantLabelsAsDependency(prop) {
    return Array.isArray(prop) ? prop.join(" ") : prop;
}

export { useCreateMotionContext };
