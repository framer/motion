/**
 * A function that accepts a progress value between `0` and `1` and returns a
 * new one. Used by many of the animation apis.
 *
 * @remarks
 *
 * ```jsx
 * const transition = {
 *   ease: value => value * value // easeInQuad
 * }
 *
 * <Frame
 *   animate={{ opacity: 0 }}
 *   transition={transition}
 * />
 * ```
 *
 * @public
 */
export type EasingFunction = (progress: number) => number

/**
 * The easing function to use. Set as one of:
 *
 * - The name of an in-built easing function.
 * - An array of four numbers to define a cubic bezier curve.
 * - An easing function, that accepts and returns a value `0-1`.
 *
 * @public
 */
export type EasingDefinition =
    | [number, number, number, number]
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "circIn"
    | "circOut"
    | "circInOut"
    | "backIn"
    | "backOut"
    | "backInOut"
    | "anticipate"
    | EasingFunction
