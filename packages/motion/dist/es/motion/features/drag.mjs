import { useDrag } from '../../gestures/drag/use-drag.mjs';
import { usePanGesture } from '../../gestures/use-pan-gesture.mjs';
import { makeRenderlessComponent } from '../utils/make-renderless-component.mjs';

var drag = {
    pan: makeRenderlessComponent(usePanGesture),
    drag: makeRenderlessComponent(useDrag),
};

export { drag };
