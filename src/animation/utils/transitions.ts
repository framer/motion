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
    ValueTarget,
    Easing,
} from "../../types"
import { getDefaultTransition } from "./default-transitions"
import { invariant } from "hey-listen"
import { ActionFactory, MotionValue } from "../../value"
import { isKeyframesTarget } from "./is-keyframes-target"

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

const easingDefinitionToFunction = (definition: Easing) => {
    if (Array.isArray(definition)) {
        // If cubic bezier definition, create bezier curve
        invariant(
            definition.length === 4,
            `Cubic bezier arrays must contain four numerical values.`
        )

        const [x1, y1, x2, y2] = definition
        return easing.cubicBezier(x1, y1, x2, y2)
    } else if (typeof definition === "string") {
        // Else lookup from table
        invariant(
            easingLookup[definition] !== undefined,
            `Invalid easing type '${definition}'`
        )
        return easingLookup[definition]
    }

    return definition
}

const transitionOptionParser = {
    tween: (opts: Tween): Tween => {
        if (opts.ease) {
            opts.ease = easingDefinitionToFunction(opts.ease)
        }

        return opts
    },
    keyframes: ({ from, to, velocity, ...opts }: Keyframes) => {
        if (opts.values[0] === null) {
            const values = [...opts.values]
            values[0] = from as string | number
            opts.values = values as string[] | number[]
        }

        if (opts.easings) {
            opts.easings = opts.easings.map(easingDefinitionToFunction)
        }

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

const getTransitionForValue = (
    key: string,
    to: ValueTarget,
    transitionDefinition?: Transition
) => {
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
        }
    }
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
    to: ValueTarget,
    transition?: Transition
): [ActionFactory, PopmotionTransitionProps] => {
    const { type = "tween", ...transitionDefinition } = getTransitionForValue(
        valueKey,
        to,
        transition
    )

    const actionFactory = transitions[type] as ActionFactory
    const opts = preprocessOptions(type, {
        from: value.get(),
        velocity: value.getVelocity(),
        ...transitionDefinition,
    })

    return [actionFactory, opts]
}
