import { action, tween, spring, keyframes, decay, inertia, physics, easing, Action } from "popmotion"
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
import { ActionFactory } from "../../value"

type JustProps = { to: string | number }
const just: ActionFactory = ({ to }: JustProps): Action => {
    return action(({ update, complete }) => {
        update(to)
        complete()
    })
}

const transitions = { tween, spring, keyframes, decay, physics, inertia, just }

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
            invariant(ease.length === 4, `Cubic bezier arrays must contain four numerical values.`)

            const [x1, y1, x2, y2] = ease
            opts.ease = easing.cubicBezier(x1, y1, x2, y2)
        } else if (typeof ease === "string") {
            // Else lookup from table
            invariant(easingLookup[ease] !== undefined, `Invalid easing type '${ease}'`)
            opts.ease = easingLookup[ease]
        }

        return opts
    },
    keyframes: ({ from, to, ...opts }: Keyframes) => opts,
}

const isTransitionDefined = ({
    beforeChildren,
    afterChildren,
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
    // If no object, return default transition
    // A better way to handle this would be to deconstruct out all the shared TransitionOrchestration props
    // and see if there's any props remaining
    if (transitionDefinition === undefined || !isTransitionDefined(transitionDefinition)) {
        return getDefaultTransition(key, to)
    }

    const { delay = 0 } = transitionDefinition
    const valueTransitionDefinition: TransitionDefinition =
        transitionDefinition[key] || (transitionDefinition as TransitionMap).default || transitionDefinition

    return valueTransitionDefinition.type === false
        ? ({ type: "just", delay, to } as PopmotionTransitionProps)
        : ({ delay, to, ...valueTransitionDefinition } as PopmotionTransitionProps)
}

const preprocessOptions = (type: string, opts: PopmotionTransitionProps): PopmotionTransitionProps =>
    transitionOptionParser[type] ? transitionOptionParser[type](opts) : opts

export const getTransition = (valueKey: string, to: string | number, transition?: Transition) => {
    const { type = "tween", ...transitionDefinition } = getTransitionForValue(valueKey, to, transition)
    const actionFactory = transitions[type]
    const opts: PopmotionTransitionProps = preprocessOptions(type, transitionDefinition)

    return [actionFactory, opts]
}
