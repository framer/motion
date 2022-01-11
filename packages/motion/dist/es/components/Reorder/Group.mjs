import { __rest, __assign } from 'tslib';
import { invariant } from 'hey-listen';
import * as React from 'react';
import { forwardRef, useRef, useEffect } from 'react';
import { ReorderContext } from '../../context/ReorderContext.mjs';
import { motion } from '../../render/dom/motion.mjs';
import { useConstant } from '../../utils/use-constant.mjs';
import { checkReorder } from './utils/check-reorder.mjs';

function ReorderGroup(_a, externalRef) {
    var children = _a.children, _b = _a.as, as = _b === void 0 ? "ul" : _b, _c = _a.axis, axis = _c === void 0 ? "y" : _c, onReorder = _a.onReorder, values = _a.values, props = __rest(_a, ["children", "as", "axis", "onReorder", "values"]);
    var Component = useConstant(function () { return motion(as); });
    var order = [];
    var isReordering = useRef(false);
    invariant(Boolean(values), "Reorder.Group must be provided a values prop");
    var context = {
        axis: axis,
        registerItem: function (value, layout) {
            /**
             * Ensure entries can't add themselves more than once
             */
            if (layout &&
                order.findIndex(function (entry) { return value === entry.value; }) === -1) {
                order.push({ value: value, layout: layout[axis] });
                order.sort(compareMin);
            }
        },
        updateOrder: function (id, offset, velocity) {
            if (isReordering.current)
                return;
            var newOrder = checkReorder(order, id, offset, velocity);
            if (order !== newOrder) {
                isReordering.current = true;
                onReorder(newOrder
                    .map(getValue)
                    .filter(function (value) { return values.indexOf(value) !== -1; }));
            }
        },
    };
    useEffect(function () {
        isReordering.current = false;
    });
    return (React.createElement(Component, __assign({}, props, { ref: externalRef }),
        React.createElement(ReorderContext.Provider, { value: context }, children)));
}
var Group = forwardRef(ReorderGroup);
function getValue(item) {
    return item.value;
}
function compareMin(a, b) {
    return a.layout.min - b.layout.min;
}

export { Group, ReorderGroup };
