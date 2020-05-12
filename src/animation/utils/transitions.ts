import {
    tween,
    spring,
    keyframes,
    inertia,
    delay as delayAction,
    ColdSubscription,
} from "popmotion"
import {
    ResolvedValueTarget,
    Transition,
    Tween,
    Keyframes,
    TransitionMap,
    PopmotionTransitionProps,
    TransitionDefinition,
    ValueTarget,
} from "../../types"
import { ActionFactory, MotionValue } from "../../value"
import { isKeyframesTarget } from "./is-keyframes-target"
import { getDefaultTransition } from "./default-transitions"
import { just } from "./just"
import { warning } from "hey-listen"
import { isEasingArray, easingDefinitionToFunction } from "./easing"
import { linear } from "@popmotion/easing"
import { isDurationAnimation } from "./is-duration-animation"
import { isAnimatable } from "./is-animatable"
import { secondsToMilliseconds } from "../../utils/time-conversion"

const transitions = { tween, spring, keyframes, inertia, just }

const transitionOptionParser = {
    tween: (opts: Tween): Tween => {
        if (opts.ease) {
            const ease = isEasingArray(opts.ease) ? opts.ease[0] : opts.ease
            opts.ease = easingDefinitionToFunction(ease)
        }

        return opts
    },
    keyframes: ({ from, to, velocity, ...opts }: Partial<Keyframes>) => {
        if (opts.values && opts.values[0] === null) {
            const values = [...opts.values]
            values[0] = from as string | number
            opts.values = values as string[] | number[]
        }

        if (opts.ease) {
            opts.easings = isEasingArray(opts.ease)
                ? opts.ease.map(easingDefinitionToFunction)
                : easingDefinitionToFunction(opts.ease)
        }
        opts.ease = linear

        return opts
    },
}

const isTransitionDefined = ({
    when,
    delay,
    delayChildren,
    staggerChildren,
    staggerDirection,
    ...transition
}: Transition) => {
    return Object.keys(transition).length
}

const getTransitionDefinition = (
    key: string,
    to: ValueTarget,
    transitionDefinition?: Transition
): PopmotionTransitionProps => {
    const delay = transitionDefinition ? transitionDefinition.delay : 0

    // If no object, return default transition
    // A better way to handle this would be to deconstruct out all the shared Orchestration props
    // and see if there's any props remaining
    if (
        transitionDefinition === undefined ||
        !isTransitionDefined(transitionDefinition)
    ) {
        return {
            delay,
            ...getDefaultTransition(key, to),
        }
    }

    const valueTransitionDefinition: TransitionDefinition =
        transitionDefinition[key] ||
        (transitionDefinition as TransitionMap).default ||
        transitionDefinition

    if (valueTransitionDefinition.type === false) {
        return {
            delay: valueTransitionDefinition.hasOwnProperty("delay")
                ? valueTransitionDefinition.delay
                : delay,
            to: isKeyframesTarget(to)
                ? (to[to.length - 1] as string | number)
                : to,
            type: "just",
        }
    } else if (isKeyframesTarget(to)) {
        return {
            values: to,
            duration: 0.8,
            delay,
            ease: "linear",
            ...valueTransitionDefinition,
            // This animation must be keyframes if we're animating through an array
            type: "keyframes",
        }
    } else {
        return {
            type: "tween",
            to,
            delay,
            ...valueTransitionDefinition,
        } as any
    }
}

const preprocessOptions = (
    type: string,
    opts: Partial<PopmotionTransitionProps>
): PopmotionTransitionProps => {
    return transitionOptionParser[type]
        ? transitionOptionParser[type](opts)
        : opts
}

const getAnimation = (
    key: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition?: Transition
): [ActionFactory, PopmotionTransitionProps] => {
    const origin = value.get()
    const isOriginAnimatable = isAnimatable(key, origin)
    const isTargetAnimatable = isAnimatable(key, target)

    // TODO we could probably improve this check to ensure both values are of the same type -
    // for instance 100 to #fff. This might live better in Popmotion.
    warning(
        isOriginAnimatable === isTargetAnimatable,
        `You are trying to animate ${key} from "${origin}" to "${target}". ${origin} is not an animatable value - to enable this animation set ${origin} to a value animatable to ${target} via the \`style\` property.`
    )

    // Parse the `transition` prop and return options for the Popmotion animation
    const { type = "tween", ...transitionDefinition } = getTransitionDefinition(
        key,
        target,
        transition
    )

    // If this is an animatable pair of values, return an animation, otherwise use `just`
    const actionFactory: ActionFactory =
        isOriginAnimatable && isTargetAnimatable
            ? (transitions[type] as ActionFactory)
            : just

    const opts = preprocessOptions(type, {
        from: origin,
        velocity: value.getVelocity(),
        ...transitionDefinition,
    })

    // Convert duration from Framer Motion's seconds into Popmotion's milliseconds
    if (isDurationAnimation(opts)) {
        if (opts.duration) {
            opts.duration = secondsToMilliseconds(opts.duration)
        }
        if (opts.repeatDelay) {
            opts.repeatDelay = secondsToMilliseconds(opts.repeatDelay)
        }
    }

    return [actionFactory, opts]
}

/**
 * Start animation on a value. This function completely encapsulates Popmotion-specific logic.
 *
 * @internal
 */
export function startAnimation(
    key: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    { delay = 0, ...transition }: Transition = {}
) {
    return value.start(complete => {
        let activeAnimation: ColdSubscription
        const [
            animationFactory,
            { delay: valueDelay, ...options },
        ] = getAnimation(key, value, target, transition)

        if (valueDelay !== undefined) {
            delay = valueDelay
        }

        const animate = () => {
            const animation = animationFactory(options)
            // Bind animation opts to animation
            activeAnimation = animation.start({
                update: (v: any) => value.set(v),
                complete,
            })
        }

        // If we're delaying this animation, only resolve it **after** the delay to
        // ensure the value's resolve velocity is up-to-date.
        if (delay) {
            activeAnimation = delayAction(secondsToMilliseconds(delay)).start({
                complete: animate,
            })
        } else {
            animate()
        }

        return () => {
            if (activeAnimation) activeAnimation.stop()
        }
    })
}
