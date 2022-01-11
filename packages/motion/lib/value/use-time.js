import { useAnimationFrame } from "../utils/use-animation-frame";
import { useMotionValue } from "./use-motion-value";
export function useTime() {
    var time = useMotionValue(0);
    useAnimationFrame(function (t) { return time.set(t); });
    return time;
}
//# sourceMappingURL=use-time.js.map