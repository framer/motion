import { __rest, __read, __assign } from 'tslib';
import { invariant } from 'hey-listen';
import * as React from 'react';
import { forwardRef, useContext, useRef, useEffect } from 'react';
import { ReorderContext } from '../../context/ReorderContext.mjs';
import { motion } from '../../render/dom/motion.mjs';
import { useConstant } from '../../utils/use-constant.mjs';
import { useMotionValue } from '../../value/use-motion-value.mjs';
import { useTransform } from '../../value/use-transform.mjs';
import { isMotionValue } from '../../value/utils/is-motion-value.mjs';

function useDefaultMotionValue(value, defaultValue) {
    if (defaultValue === void 0) { defaultValue = 0; }
    return isMotionValue(value) ? value : useMotionValue(defaultValue);
}
function ReorderItem(_a, externalRef) {
    var children = _a.children, style = _a.style, value = _a.value, _b = _a.as, as = _b === void 0 ? "li" : _b, onDrag = _a.onDrag, props = __rest(_a, ["children", "style", "value", "as", "onDrag"]);
    var Component = useConstant(function () { return motion(as); });
    var context = useContext(ReorderContext);
    var point = {
        x: useDefaultMotionValue(style === null || style === void 0 ? void 0 : style.x),
        y: useDefaultMotionValue(style === null || style === void 0 ? void 0 : style.y),
    };
    var zIndex = useTransform([point.x, point.y], function (_a) {
        var _b = __read(_a, 2), latestX = _b[0], latestY = _b[1];
        return latestX || latestY ? 1 : "unset";
    });
    var layout = useRef(null);
    invariant(Boolean(context), "Reorder.Item must be a child of Reorder.Group");
    var _c = context, axis = _c.axis, registerItem = _c.registerItem, updateOrder = _c.updateOrder;
    useEffect(function () {
        registerItem(value, layout.current);
    }, [context]);
    return (React.createElement(Component, __assign({ drag: axis }, props, { dragSnapToOrigin: true, style: __assign(__assign({}, style), { x: point.x, y: point.y, zIndex: zIndex }), layout: true, onDrag: function (event, gesturePoint) {
            var velocity = gesturePoint.velocity;
            velocity[axis] &&
                updateOrder(value, point[axis].get(), velocity[axis]);
            onDrag === null || onDrag === void 0 ? void 0 : onDrag(event, gesturePoint);
        }, onLayoutMeasure: function (measured) {
            layout.current = measured;
        }, ref: externalRef }), children));
}
var Item = forwardRef(ReorderItem);

export { Item, ReorderItem };
