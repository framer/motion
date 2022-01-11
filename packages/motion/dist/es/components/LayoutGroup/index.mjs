import { __read, __assign } from 'tslib';
import * as React from 'react';
import { useContext, useRef, useMemo } from 'react';
import { LayoutGroupContext } from '../../context/LayoutGroupContext.mjs';
import { DeprecatedLayoutGroupContext } from '../../context/DeprecatedLayoutGroupContext.mjs';
import { useForceUpdate } from '../../utils/use-force-update.mjs';
import { nodeGroup } from '../../projection/node/group.mjs';

var LayoutGroup = function (_a) {
    var _b, _c;
    var children = _a.children, id = _a.id, _d = _a.inheritId, inheritId = _d === void 0 ? true : _d;
    var layoutGroupContext = useContext(LayoutGroupContext);
    var deprecatedLayoutGroupContext = useContext(DeprecatedLayoutGroupContext);
    var _e = __read(useForceUpdate(), 2), forceRender = _e[0], key = _e[1];
    var context = useRef(null);
    var upstreamId = (_b = layoutGroupContext.id) !== null && _b !== void 0 ? _b : deprecatedLayoutGroupContext;
    if (context.current === null) {
        if (inheritId && upstreamId) {
            id = id ? upstreamId + "-" + id : upstreamId;
        }
        context.current = {
            id: id,
            group: inheritId
                ? (_c = layoutGroupContext === null || layoutGroupContext === void 0 ? void 0 : layoutGroupContext.group) !== null && _c !== void 0 ? _c : nodeGroup()
                : nodeGroup(),
        };
    }
    var memoizedContext = useMemo(function () { return (__assign(__assign({}, context.current), { forceRender: forceRender })); }, [key]);
    return (React.createElement(LayoutGroupContext.Provider, { value: memoizedContext }, children));
};

export { LayoutGroup };
