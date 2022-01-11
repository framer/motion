import { useAnimationFrame } from '../utils/use-animation-frame.mjs';
import { useMotionValue } from './use-motion-value.mjs';

function useTime() {
    var time = useMotionValue(0);
    useAnimationFrame(function (t) { return time.set(t); });
    return time;
}

export { useTime };
