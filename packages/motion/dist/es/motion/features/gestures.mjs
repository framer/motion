import { useFocusGesture } from '../../gestures/use-focus-gesture.mjs';
import { useHoverGesture } from '../../gestures/use-hover-gesture.mjs';
import { useTapGesture } from '../../gestures/use-tap-gesture.mjs';
import { useViewport } from './viewport/use-viewport.mjs';
import { makeRenderlessComponent } from '../utils/make-renderless-component.mjs';

var gestureAnimations = {
    inView: makeRenderlessComponent(useViewport),
    tap: makeRenderlessComponent(useTapGesture),
    focus: makeRenderlessComponent(useFocusGesture),
    hover: makeRenderlessComponent(useHoverGesture),
};

export { gestureAnimations };
