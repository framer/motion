import { useDrag } from "../../gestures/drag/use-drag";
import { usePanGesture } from "../../gestures/use-pan-gesture";
import { makeRenderlessComponent } from "../utils/make-renderless-component";
export var drag = {
    pan: makeRenderlessComponent(usePanGesture),
    drag: makeRenderlessComponent(useDrag),
};
//# sourceMappingURL=drag.js.map