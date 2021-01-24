import {
    Transition,
    PermissiveTransitionDefinition,
    ResolvedValueTarget,
} from "../../types"
import { AnimationOptions, animate, inertia } from "popmotion"
import { secondsToMilliseconds } from "../../utils/time-conversion"
import { isEasingArray, easingDefinitionToFunction } from "./easing"
import { MotionValue } from "../../value"
import { isAnimatable } from "./is-animatable"
import { getDefaultTransition } from "./default-transitions"
import { warning } from "hey-listen"
import { getAnimatableNone } from "../../render/dom/utils/value-types"

type StopAnimation = { stop: () => void }

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
    repeat,
    repeatType,
    repeatDelay,
    from,
    ...transition
}: Transition) {
    return !!Object.keys(transition).length
}

let legacyRepeatWarning = false
/**
 * Convert Framer Motion's Transition type into Popmotion-compatible options.
 */
export function convertTransitionToAnimationOptions<T>({
    ease,
    times,
    yoyo,
    flip,
    loop,
    ...transition
}: PermissiveTransitionDefinition): AnimationOptions<T> {
    const options: AnimationOptions<T> = { ...transition }

    if (times) options["offset"] = times

    /**
     * Convert any existing durations from seconds to milliseconds
     */
    if (transition.duration)
        options["duration"] = secondsToMilliseconds(transition.duration)
    if (transition.repeatDelay)
        options.repeatDelay = secondsToMilliseconds(transition.repeatDelay)

    /**
     * Map easing names to Popmotion's easing functions
     */
    if (ease) {
        options["ease"] = isEasingArray(ease)
            ? ease.map(easingDefinitionToFunction)
            : easingDefinitionToFunction(ease)
    }

    /**
     * Support legacy transition API
     */
    if (transition.type === "tween") options.type = "keyframes"

    /**
     * TODO: These options are officially removed from the API.
     */
    if (yoyo || loop || flip) {
        warning(
            !legacyRepeatWarning,
            "yoyo, loop and flip have been removed from the API. Replace with repeat and repeatType options."
        )
        legacyRepeatWarning = true
        if (yoyo) {
            options.repeatType = "reverse"
        } else if (loop) {
            options.repeatType = "loop"
        } else if (flip) {
            options.repeatType = "mirror"
        }
        options.repeat = loop || yoyo || flip || transition.repeat
    }

    /**
     * TODO: Popmotion 9 has the ability to automatically detect whether to use
     * a keyframes or spring animation, but does so by detecting velocity and other spring options.
     * It'd be good to introduce a similar thing here.
     */
    if (transition.type !== "spring") options.type = "keyframes"

    return options
}

/**
 * Get the delay for a value by checking Transition with decreasing specificity.
 */
export function getDelayFromTransition(transition: Transition, key: string) {
    return (
        transition[key]?.delay ??
        transition["default"]?.delay ??
        transition.delay ??
        0
    )
}

export function hydrateKeyframes(options: PermissiveTransitionDefinition) {
    if (Array.isArray(options.to) && options.to[0] === null) {
        options.to = [...options.to]
        options.to[0] = options.from
    }

    return options
}

export function getPopmotionAnimationOptions(
    transition: PermissiveTransitionDefinition,
    options: any,
    key: string
) {
    if (Array.isArray(options.to)) {
        transition.duration ??= 0.8
    }

    hydrateKeyframes(options)

    /**
     * Get a default transition if none is determined to be defined.
     */
    if (!isTransitionDefined(transition)) {
        transition = {
            ...transition,
            ...getDefaultTransition(key, options.to),
        }
    }

    return {
        ...options,
        ...convertTransitionToAnimationOptions(transition),
    }
}

/**
 *
 */
function getAnimation(
    key: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition: PermissiveTransitionDefinition,
    onComplete: () => void
) {
    const valueTransition = getValueTransition(transition, key)
    let origin = valueTransition.from ?? value.get()

    const isTargetAnimatable = isAnimatable(key, target)

    /**
     * If we're trying to animate from "none", try and get an animatable version
     * of the target. This could be improved to work both ways.
     */
    if (origin === "none" && isTargetAnimatable && typeof target === "string") {
        origin = getAnimatableNone(key, target)
    }

    const isOriginAnimatable = isAnimatable(key, origin)

    warning(
        isOriginAnimatable === isTargetAnimatable,
        `You are trying to animate ${key} from "${origin}" to "${target}". ${origin} is not an animatable value - to enable this animation set ${origin} to a value animatable to ${target} via the \`style\` property.`
    )

    function start(): StopAnimation {
        const options = {
            from: origin,
            to: target,
            velocity: value.getVelocity(),
            onComplete,
            onUpdate: (v: Animatable) => value.set(v),
        }

        return valueTransition.type === "inertia" ||
            valueTransition.type === "decay"
            ? inertia({ ...options, ...valueTransition })
            : animate({
                  ...getPopmotionAnimationOptions(
                      valueTransition,
                      options,
                      key
                  ),
                  onUpdate: (v: any) => {
                      options.onUpdate(v)
                      valueTransition.onUpdate?.(v)
                  },
                  onComplete: () => {
                      options.onComplete()
                      valueTransition.onComplete?.()
                  },
              })
    }

    function set(): StopAnimation {
        value.set(target)
        onComplete()
        valueTransition?.onComplete?.()
        return { stop: () => {} }
    }

    return !isOriginAnimatable ||
        !isTargetAnimatable ||
        valueTransition.type === false
        ? set
        : start
}

export function getValueTransition(transition: Transition, key: string) {
    return transition[key] || transition["default"] || transition
}

/**
 * Start animation on a MotionValue. This function is an interface between
 * Framer Motion and Popmotion
 *
 * @internal
 */
export function startAnimation(
    key: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition: Transition = {}
) {
    return value.start((onComplete) => {
        let delayTimer: number
        let controls: StopAnimation
        const animation = getAnimation(
            key,
            value,
            target,
            transition,
            onComplete
        )
        const delay = getDelayFromTransition(transition, key)

        const start = () => (controls = animation())

        if (delay) {
            delayTimer = setTimeout(start, secondsToMilliseconds(delay))
        } else {
            start()
        }

        return () => {
            clearTimeout(delayTimer)
            controls?.stop()
        }
    })
}
