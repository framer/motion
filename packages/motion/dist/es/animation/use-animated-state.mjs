import { __rest, __assign, __read } from 'tslib';
import { useState, useEffect } from 'react';
import { useConstant } from '../utils/use-constant.mjs';
import { getOrigin, checkTargetForNewValues } from '../render/utils/setters.mjs';
import { visualElement } from '../render/index.mjs';
import { animateVisualElement } from '../render/utils/animation.mjs';
import { makeUseVisualState } from '../motion/utils/use-visual-state.mjs';
import { createBox } from '../projection/geometry/models.mjs';

var createObject = function () { return ({}); };
var stateVisualElement = visualElement({
    build: function () { },
    measureViewportBox: createBox,
    resetTransform: function () { },
    restoreTransform: function () { },
    removeValueFromRenderState: function () { },
    render: function () { },
    scrapeMotionValuesFromProps: createObject,
    readValueFromInstance: function (_state, key, options) {
        return options.initialState[key] || 0;
    },
    makeTargetAnimatable: function (element, _a) {
        var transition = _a.transition, transitionEnd = _a.transitionEnd, target = __rest(_a, ["transition", "transitionEnd"]);
        var origin = getOrigin(target, transition || {}, element);
        checkTargetForNewValues(element, target, origin);
        return __assign({ transition: transition, transitionEnd: transitionEnd }, target);
    },
});
var useVisualState = makeUseVisualState({
    scrapeMotionValuesFromProps: createObject,
    createRenderState: createObject,
});
/**
 * This is not an officially supported API and may be removed
 * on any version.
 * @internal
 */
function useAnimatedState(initialState) {
    var _a = __read(useState(initialState), 2), animationState = _a[0], setAnimationState = _a[1];
    var visualState = useVisualState({}, false);
    var element = useConstant(function () {
        return stateVisualElement({ props: {}, visualState: visualState }, { initialState: initialState });
    });
    useEffect(function () {
        element.mount({});
        return element.unmount();
    }, []);
    useEffect(function () {
        element.setProps({
            onUpdate: function (v) { return setAnimationState(__assign({}, v)); },
        });
    });
    var startAnimation = useConstant(function () { return function (animationDefinition) {
        return animateVisualElement(element, animationDefinition);
    }; });
    return [animationState, startAnimation];
}

export { useAnimatedState };
