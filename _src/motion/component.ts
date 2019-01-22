import { memo, forwardRef, createElement, Ref, ComponentType, NamedExoticComponent } from "react"
import { MotionProps, ComponentFactory, PoseConfig, PoseConfigFactory } from "./types"
import { useConfig } from "../hooks/use-config"
import { useExternalRef } from "../hooks/use-external-ref"
import { usePosedValues } from "../hooks/use-posed-values"
import { useTargetResolver } from "../hooks/use-pose-resolver"
import { useStyleAttr } from "../hooks/use-style-attr"
import { useScrollValues } from "../scroll/use-scroll-values"

/**
 * `motion` creates React components that are optimised for use in animation and interactions.
 *
 * **Note:** These must be defined **outside** the render function.
 *
 * ## Import
 *
 * ```javascript
 * import { motion } from 'framer-motion'
 * ```
 *
 * ## Creating motion components
 *
 * ### HTML/SVG elements
 *
 * `motion` provides shorthands for most HTML and SVG elements:
 *
 * ```javascript
 * const MotionComponent = motion.div()
 * ```
 *
 * ### Existing components (advanced)
 *
 * Existing components can also be optimised for use in animation by wrapping them in React's `forwardRef` function, and providing its `ref` argument to the component's animating HTML/SVG element:
 *
 * ```javascript
 * const MyComponent = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion(MyComponent)()
 * ```
 *
 * ## Animate
 *
 * Components can be animated between different visual states, called "poses".
 *
 * Poses are defined via the `motion` function:
 *
 * ```javascript
 * const MotionComponent = motion.div({
 *   hidden: { opacity: 0 },
 *   visible: { opacity: 1 }
 * })
 * ```
 *
 * When we render this component, we can provide a `pose` property that decides which of these visual states our component will be in:
 *
 * ```javascript
 * <MotionComponent pose={isVisible ? 'visible' : 'hidden'} />
 * ```
 *
 * When this `pose` property changes, the component will automatically animate into its new visual state.
 *
 * ### Custom transitions
 *
 * Custom transitions can be defined by providing a `transition` property to a pose.
 *
 * ```javascript
 * const MotionComponent = motion.div({
 *   hidden: {
 *      opacity: 0,
 *      transition: {
 *          duration: 400
 *      }
 *   },
 *   visible: { opacity: 1 }
 * })
 * ```
 *
 * `transition` can either define one transition for all pose values, **or** a different transition for each value:
 *
 * ```javascript
 * const MotionComponent = motion.div({
 *   default: { scale: 1, backgroundColor: '#f00' },
 *   hover: {
 *      scale: 1.3,
 *      backgroundColor: '#900',
 *      transition: {
 *          scale: { type: 'spring' },
 *          default: { duration: 200 }
 *      }
 *   }
 * })
 * ```
 *
 * This property can be used to select from one of five animation types: `'tween'`, `'spring'`, `'keyframes'`, `'physics'`, and `'decay'`.
 *
 * #### Tween (default)
 *
 * Animate to a new state over a set duration of time.
 *
 * ##### Props
 *
 * - `duration?: number = 300`: Total duration of animation, in milliseconds.
 * - `elapsed?: number = 0`: Duration of animation already elapsed, in milliseconds.
 * - `ease?: string | number[] | Function`: The name of an easing function, a cubic bezier definition (as an array of numbers), or an easing function. The following easings are included with Pose:
 *   - 'linear'
 *   - 'easeIn', 'easeOut', 'easeInOut'
 *   - 'circIn', 'circOut', 'circInOut'
 *   - 'backIn', 'backOut', 'backInOut'
 *   - 'anticipate'
 * - `loop?: number = 0`: Number of times to loop animation.
 * - `flip?: number = 0`: Number of times to flip animation.
 * - `yoyo?: number = 0`: Number of times to reverse tween.
 *
 * #### Spring
 *
 * Animate to a new state using spring physics.
 *
 * ##### Props
 *
 * - `type: 'spring'`: Set transition to spring.
 * - `stiffness?: number = 100`: Spring stiffness.
 * - `damping?: number = 10`: Strength of opposing force.
 * - `mass?: number = 1.0`: Mass of the moving object.
 * - `restDelta?: number = 0.01`: End animation if distance to `to` is below this value **and** `restSpeed` is `true`.
 * - `restSpeed?: number = 0.01`: End animation if speed drops below this value **and** `restDelta` is `true`.
 *
 * #### Keyframes
 *
 * Animate to a new state via a sequence of values.
 *
 * ##### Props
 *
 * - `type: 'keyframes'`: Set transition to keyframes.
 * - `values: number[]`: An array of numbers to animate between. To use the value defined in the Pose as the final target value, set `transition` as a function: `transition: ({ to }) => { type: 'keyframes', values: [0, to] }`
 * - `duration?: number = 300`: Total duration of animation, in milliseconds.
 * - `easings?: Easing | Easing[]`: An array of easing functions for each generated tween, or a single easing function applied to all tweens. This array should be `values.length - 1`. Defaults to `easeOut`. (This doesn't yet support named easings)
 * - `times?: number[]`: An array of numbers between `0` and `1`, representing `0` to `duration`, that represent at which point each number should be hit. Defaults to an array of evenly-spread durations will be calculated.
 * - `elapsed?: number = 0`: Duration of animation already elapsed, in milliseconds.
 * - `ease?: Easing = easeOut`: A function, given a progress between `0` and `1`, that returns a new progress value. Used to affect the rate of playback across the duration of the animation. (This doesn't yet support named easings)
 * - `loop?: number = 0`: Number of times to loop animation.
 * - `flip?: number = 0`: Number of times to flip animation.
 * - `yoyo?: number = 0`: Number of times to reverse tween.
 *
 * #### Physics
 *
 * Animate using a simulation of velocity, friction and acceleration.
 *
 * ##### Props
 *
 * - `type: 'physics'`: Set transition to physics.
 * - `acceleration?: number = 0`: Increase `velocity` by this amount every second.
 * - `restSpeed?: number = 0.001`: When absolute speed drops below this value, `complete` is fired.
 * - `friction?: number = 0`: Amount of friction to apply per frame, from `0` to `1`.
 *
 * #### Decay
 *
 * Animate to a target value automatically generated by the value's current velocity.
 *
 * ##### Props
 *
 * - `type: 'decay'`: Set transition to decay.
 * - `power?: number = 0.8`: A constant with which to calculate a target value. Higher power = further target. `0.8` should be okay.
 * - `timeConstant?: number = 350`: Adjusting the time constant will change the duration of the deceleration, thereby affecting its feel.
 * - `restDelta?: number = 0.5`: Automatically completes the action when the calculated value is this far away from the target.
 * - `modifyTarget?: (v: number) => number`: A function that receives the calculated target and returns a new one. Useful for snapping the target to a grid, for example.
 *
 * ### Dynamic poses
 *
 * Poses can be defined as functions that resolve when the `pose` attribute changes.
 *
 * These functions receive three arguments:
 *
 * - `props`: The current props provided to the component
 * - `current`: An object containing the current state of all animated values
 * - `velocity`: An object containing the current velocity of all animated values
 *
 * This allows you to return different poses based on the above information.
 *
 * ```javascript
 * const MotionComponent = motion.div({
 *     dragging: { scale: 1.2 },
 *     rest: (props, current, velocity) => velocity.x > -1
 *          ? { x: -500, opacity: 0 }
 *          : { x: 0 }
 * })
 * ```
 */

export const createMotionComponent = <P extends {}>(Component: string | ComponentType<P>): ComponentFactory<P> => {
    return (poseConfig: PoseConfigFactory | PoseConfig = {}): NamedExoticComponent<P & MotionProps> => {
        {
            const MotionComponent = (props: P & MotionProps, externalRef?: Ref<Element>) => {
                const ref = useExternalRef(externalRef)
                const config = useConfig(poseConfig, props)

                // Create motion values
                const [values, componentProps] = usePosedValues(config, props, ref)

                useTargetResolver(values, config, props, ref)

                return createElement<any>(Component, {
                    ...componentProps,
                    ref,
                    style: useStyleAttr(values, props.style),
                    onScroll: useScrollValues(values, props.onScroll),
                })
            }

            return memo(forwardRef(MotionComponent))
        }
    }
}
