import { action, tween, spring, keyframes, decay, physics, easing, Action } from "popmotion"
import {
    PoseTransition,
    Tween,
    Keyframes,
    EasingFunction,
    TransitionMap,
    PopmotionTransitionDefinition,
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

const transitions = { tween, spring, keyframes, decay, physics, just }

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

const getTransitionForValue = (
    key: string,
    to: string | number,
    transitionDefinition?: PoseTransition
): PopmotionTransitionDefinition => {
    // If no object, return default transition
    // A better way to handle this would be to deconstruct out all the shared TransitionOrchestration props
    // and see if there's any props remaining
    if (transitionDefinition === undefined) {
        return getDefaultTransition(key, to)
    }

    const { delay = 0 } = transitionDefinition
    const valueTransitionDefinition: TransitionDefinition =
        transitionDefinition[key] || (transitionDefinition as TransitionMap).default || transitionDefinition

    return valueTransitionDefinition.type === false
        ? ({ type: "just", delay, to } as PopmotionTransitionDefinition)
        : ({ delay, to, ...valueTransitionDefinition } as PopmotionTransitionDefinition)
}

const preprocessOptions = (type: string, opts: PopmotionTransitionDefinition): PopmotionTransitionDefinition =>
    transitionOptionParser[type] ? transitionOptionParser[type](opts) : opts

export const getTransition = (
    valueKey: string,
    to: string | number,
    transition?: PoseTransition
): [ActionFactory, PopmotionTransitionDefinition] => {
    const { type = "tween", ...transitionDefinition } = getTransitionForValue(valueKey, to, transition)
    const actionFactory: ActionFactory = transitions[type]
    const opts: PopmotionTransitionDefinition = preprocessOptions(type, transitionDefinition)

    return [actionFactory, opts]
}
