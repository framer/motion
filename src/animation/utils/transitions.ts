import { Transition } from "../../types"

// import {
//     animate,
//     inertia,
//     PlaybackControls,
//     AnimationOptions,
//     InertiaOptions,
//     Animatable,
// } from "popmotion"
// import {
//     ResolvedValueTarget,
//     Transition,
//     Tween,
//     Keyframes,
//     TransitionMap,
//     PopmotionTransitionProps,
//     TransitionDefinition,
//     ValueTarget,
// } from "../../types"
// import { MotionValue } from "../../value"
// import { isKeyframesTarget } from "./is-keyframes-target"
// import { getDefaultTransition } from "./default-transitions"
// import { warning } from "hey-listen"
// import { isEasingArray, easingDefinitionToFunction } from "./easing"
// import { isAnimatable } from "./is-animatable"
// import { secondsToMilliseconds } from "../../utils/time-conversion"

/**
 * Decide whether a transition is defined on a given Transition.
 * This filters out orchestration options and returns true
 * if any options are left.
 */
export function isTransitionDefined({
    when,
    delay,
    delayChildren,
    staggerChildren,
    staggerDirection,
    ...transition
}: Transition) {
    return !!Object.keys(transition).length
}

// function convertMotionToPopmotion<T extends Animatable>(
//     options: TransitionDefinition,
//     target: T | T[]
// ): Partial<AnimationOptions<T>> | Partial<InertiaOptions> {
//     const popmotionOptions:
//         | Partial<AnimationOptions<T>>
//         | Partial<InertiaOptions> = {}

//     // Instant transition
//     if (options.type === false) {
//         return { duration: 0 }
//     } else {
//         popmotionOptions.duration = isKeyframesTarget(target as any) ? 0.8 : 0.3
//     }

//     // Convert Motion's second-based durations to Popmotion's milliseconds
//     if (options.duration) {
//         options.duration = secondsToMilliseconds(options.duration)
//     }
//     if (options.repeatDelay) {
//         options.repeatDelay = secondsToMilliseconds(options.repeatDelay)
//     }

//     if (options.ease) {
//         options.ease = isEasingArray(options.ease)
//             ? options.ease.map(easingDefinitionToFunction)
//             : easingDefinitionToFunction(options.ease)
//     }

//     return popmotionOptions
// }

// function getAnimationOptions<T extends Animatable>(
//     key: string,
//     target: T | T[],
//     definition?: Transition
// ): AnimationOptions<T> | InertiaOptions {
//     const delay = definition ? definition.delay : 0

//     /**
//      * If no transition has been set, return the default transition.
//      */
//     if (definition === undefined || !isTransitionDefined(definition)) {
//         return { delay, ...getDefaultTransition(key, target) }
//     }

//     /**
//      * Get the transition specific to this value. In order of specificity, this
//      * descends from key-specific, "default", to the transition object itself.
//      */
//     const valueDefinition: TransitionDefinition =
//         definition[key] || definition["default"] || definition

//     return convertMotionToPopmotion(valueDefinition, target)
// }

// function getAnimation(
//     key: string,
//     value: MotionValue,
//     target: ResolvedValueTarget,
//     transition?: Transition
// ) {
//     let factory: typeof animate | typeof inertia
//     const isOriginAnimatable = isAnimatable(key, origin)
//     const isTargetAnimatable = isAnimatable(key, target)

//     // TODO we could probably improve this check to ensure both values are of the same type -
//     // for instance 100 to #fff.
//     warning(
//         isOriginAnimatable === isTargetAnimatable,
//         `You are trying to animate ${key} from "${origin}" to "${target}". ${origin} is not an animatable value - to enable this animation set ${origin} to a value animatable to ${target} via the \`style\` property.`
//     )

//     // Parse the `transition` prop and return options for the Popmotion animation
//     const options = getAnimationOptions(key, target, transition)

//     return (onComplete: () => void) => {
//         preprocess(options)

//         return factory({
//             from: value.get(),
//             velocity: value.getVelocity(),
//             ...options,
//             onComplete,
//         })
//     }
// }

// /**
//  * Start animation on a value. This function is an interface to Popmotion.
//  *
//  * @internal
//  */
// export function startAnimation(
//     key: string,
//     value: MotionValue,
//     target: ResolvedValueTarget,
//     transition: Transition = {}
// ) {
//     return value.start(complete => {
//         let timeout: number
//         const start = getAnimation(key, value, target, transition)

//         let controls: PlaybackControls
//         if (delay) {
//             timeout = setTimeout(
//                 () => start(complete),
//                 secondsToMilliseconds(delay)
//             )
//         } else {
//             controls = start(complete)
//         }

//         return () => {
//             clearTimeout(timeout)
//             controls?.stop()
//         }
//     })
// }
