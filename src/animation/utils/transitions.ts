import {
    action,
    tween,
    spring,
    keyframes,
    inertia,
    physics,
    easing,
    Action,
} from "popmotion"
import {
    Transition,
    Tween,
    Keyframes,
    EasingFunction,
    TransitionMap,
    PopmotionTransitionProps,
    TransitionDefinition,
} from "../../types"
import { getDefaultTransition } from "./default-transitions"
import { invariant } from "hey-listen"
import { ActionFactory, MotionValue } from "../../value"

type JustProps = { to: string | number }
const just: ActionFactory = ({ to }: JustProps): Action => {
    return action(({ update, complete }) => {
        update(to)
        complete()
    })
}

const transitions = { tween, spring, keyframes, physics, inertia, just }

const {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    circIn,
    circOut,
    circInOut,
    backIn,
    backOut,
    backInOut,
    anticipate,
} = easing

const easingLookup: { [key: string]: EasingFunction } = {
    linear,
    easeIn,
    easeOut,
    easeInOut,
    circIn,
    circOut,
    circInOut,
    backIn,
    backOut,
    backInOut,
    anticipate,
}

const transitionOptionParser = {
    tween: (opts: Tween): Tween => {
        const { ease } = opts

        if (Array.isArray(ease)) {
            // If cubic bezier definition, create bezier curve
            invariant(
                ease.length === 4,
                `Cubic bezier arrays must contain four numerical values.`
            )

            const [x1, y1, x2, y2] = ease
            opts.ease = easing.cubicBezier(x1, y1, x2, y2)
        } else if (typeof ease === "string") {
            // Else lookup from table
            invariant(
                easingLookup[ease] !== undefined,
                `Invalid easing type '${ease}'`
            )
            opts.ease = easingLookup[ease]
        }

        return opts
    },
    keyframes: ({ from, to, velocity, ...opts }: Keyframes) => opts,
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

const getTransitionForValue = (
    key: string,
    to: string | number,
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

    return valueTransitionDefinition.type === false
        ? ({ type: "just", delay, to } as PopmotionTransitionProps)
        : ({
              delay,
              to,
              ...valueTransitionDefinition,
          } as PopmotionTransitionProps)
}

const preprocessOptions = (
    type: string,
    opts: PopmotionTransitionProps
): PopmotionTransitionProps => {
    return transitionOptionParser[type]
        ? transitionOptionParser[type](opts)
        : opts
}

export const getTransition = (
    value: MotionValue,
    valueKey: string,
    to: string | number,
    transition?: Transition
) => {
    const { type = "tween", ...transitionDefinition } = getTransitionForValue(
        valueKey,
        to,
        transition
    )

    const actionFactory = transitions[type]
    const opts = preprocessOptions(type, {
        from: value.get(),
        velocity: value.getVelocity(),
        ...transitionDefinition,
    })

    return [actionFactory, opts]
}
