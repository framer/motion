import { Transition } from "../../types"
import { getAnimatableNone } from "../../render/dom/value-types/animatable-none"

/**
 * Decide whether a transition is defined on a given Transition.
 * This filters out orchestration options and returns true
 * if any options are left.
 */
export function isTransitionDefined({
    when,
    delay: _delay,
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

export function isZero(value: string | number) {
    return (
        value === 0 ||
        (typeof value === "string" &&
            parseFloat(value) === 0 &&
            value.indexOf(" ") === -1)
    )
}

export function getZeroUnit(
    potentialUnitType: string | number
): string | number {
    return typeof potentialUnitType === "number"
        ? 0
        : getAnimatableNone("", potentialUnitType)
}

export function getValueTransition(transition: Transition, key: string) {
    return transition[key] || transition["default"] || transition
}
