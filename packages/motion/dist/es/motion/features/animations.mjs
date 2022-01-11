import { __read } from 'tslib';
import { useEffect, useContext } from 'react';
import { isAnimationControls } from '../../animation/utils/is-animation-controls.mjs';
import { usePresence } from '../../components/AnimatePresence/use-presence.mjs';
import { PresenceContext } from '../../context/PresenceContext.mjs';
import { createAnimationState } from '../../render/utils/animation-state.mjs';
import { AnimationType } from '../../render/utils/types.mjs';
import { makeRenderlessComponent } from '../utils/make-renderless-component.mjs';

var animations = {
    animation: makeRenderlessComponent(function (_a) {
        var visualElement = _a.visualElement, animate = _a.animate;
        /**
         * We dynamically generate the AnimationState manager as it contains a reference
         * to the underlying animation library. We only want to load that if we load this,
         * so people can optionally code split it out using the `m` component.
         */
        visualElement.animationState || (visualElement.animationState = createAnimationState(visualElement));
        /**
         * Subscribe any provided AnimationControls to the component's VisualElement
         */
        if (isAnimationControls(animate)) {
            useEffect(function () { return animate.subscribe(visualElement); }, [animate]);
        }
    }),
    exit: makeRenderlessComponent(function (props) {
        var custom = props.custom, visualElement = props.visualElement;
        var _a = __read(usePresence(), 2), isPresent = _a[0], safeToRemove = _a[1];
        var presenceContext = useContext(PresenceContext);
        useEffect(function () {
            var _a, _b;
            visualElement.isPresent = isPresent;
            var animation = (_a = visualElement.animationState) === null || _a === void 0 ? void 0 : _a.setActive(AnimationType.Exit, !isPresent, { custom: (_b = presenceContext === null || presenceContext === void 0 ? void 0 : presenceContext.custom) !== null && _b !== void 0 ? _b : custom });
            !isPresent && (animation === null || animation === void 0 ? void 0 : animation.then(safeToRemove));
        }, [isPresent]);
    }),
};

export { animations };
