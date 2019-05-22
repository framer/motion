import {
    tween,
    spring,
    keyframes,
    inertia,
    chain,
    delay as delayAction,
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
            type: "just",
            delay,
            to: isKeyframesTarget(to)
                ? (to[to.length - 1] as string | number)
                : to,
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

export const getAnimation = (
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
        `You are trying to animate ${key} from "${origin}" to ${target}. "${origin}" is not an animatable value - to enable this animation set ${origin} to a value animatable to ${target} via the \`style\` property.`
    )

    // Parse the `transition` prop and return options for the Popmotion animation
    const { type = "tween", ...transitionDefinition } = getTransitionDefinition(
        key,
        target,
        transition
    )

    // If this is an animatable pair of values, return an animation, otherwise use `just`
    const actionFactory: ActionFactory =
        isOriginAnimatable && isTargetAnimatable ? transitions[type] : just

    const opts = preprocessOptions(type, {
        from: origin,
        velocity: value.getVelocity(),
        ...transitionDefinition,
    })

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
    { delay = 0, ...transition }: Transition
) {
    delay = transition && transition.delay ? transition.delay : delay
    const [animationFactory, opts] = getAnimation(
        key,
        value,
        target,
        transition
    )

    // Convert durations from Framer Motion seconds into Popmotion milliseconds
    if (isDurationAnimation(opts) && opts.duration) {
        opts.duration *= 1000
    }
    delay *= 1000

    // Bind animation opts to animation
    let animation = animationFactory(opts)

    // Compose delay
    if (delay) {
        animation = chain(delayAction(delay), animation)
    }

    return value.start(complete => {
        const activeAnimation = animation.start({
            update: (v: any) => value.set(v),
            complete,
        })

        return () => activeAnimation.stop()
    })
}
