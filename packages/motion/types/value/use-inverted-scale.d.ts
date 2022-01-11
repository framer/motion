import { MotionValue } from "./";
interface ScaleMotionValues {
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
}
export declare const invertScale: (scale: number) => number;
/**
 * Returns a `MotionValue` each for `scaleX` and `scaleY` that update with the inverse
 * of their respective parent scales.
 *
 * This is useful for undoing the distortion of content when scaling a parent component.
 *
 * By default, `useInvertedScale` will automatically fetch `scaleX` and `scaleY` from the nearest parent.
 * By passing other `MotionValue`s in as `useInvertedScale({ scaleX, scaleY })`, it will invert the output
 * of those instead.
 *
 * ```jsx
 * const MyComponent = () => {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <motion.div style={{ scaleX, scaleY }} />
 * }
 * ```
 *
 * @deprecated
 * @internal
 */
export declare function useInvertedScale(scale?: Partial<ScaleMotionValues>): ScaleMotionValues;
export {};
