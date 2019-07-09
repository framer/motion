import {
    MotionProps,
    AnimationProps,
    ResolvePositionTransition,
} from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { useLayoutEffect, RefObject } from "react"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import styler from "stylefire"
import { Transition } from "../../types"

interface Position {
    x: number
    y: number
}

const hasMoved = (a: Position, b: Position) => a.x !== b.x || a.y !== b.y

const measureDelta = (origin: Position, target: Position) => ({
    x: origin.x - target.x,
    y: origin.y - target.y,
})

const isHTMLElement = (element: Element | null): element is HTMLElement =>
    typeof HTMLElement !== "undefined" && element instanceof HTMLElement

const createTransition = (
    values: MotionValuesMap,
    positionTransition: Transition | boolean = {}
) => (axis: "x" | "y", offset: number) => {
    const baseTransition =
        typeof positionTransition === "boolean" ? {} : positionTransition
    const value = values.get(axis, 0)
    const velocity = value.getVelocity()
    const transition = baseTransition.hasOwnProperty(axis)
        ? baseTransition[axis]
        : baseTransition

    if (transition.velocity === undefined) transition.velocity = velocity

    value.set(offset + value.get())

    return transition
}

function isResolver(
    transition: AnimationProps["positionTransition"]
): transition is ResolvePositionTransition {
    return typeof transition === "function"
}

function usePositionAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    positionTransition: AnimationProps["positionTransition"]
) {
    const getPosition = () => {
        const element = ref.current

        return isHTMLElement(element)
            ? { x: element.offsetLeft, y: element.offsetTop }
            : null
    }

    // Take a record of the current bounding box
    let prev = getPosition()

    useLayoutEffect(() => {
        const target = getPosition()

        if (prev && target && hasMoved(prev, target)) {
            const delta = measureDelta(prev, target)

            const transitionDefinition = isResolver(positionTransition)
                ? positionTransition({ delta })
                : positionTransition

            const transition = createTransition(values, transitionDefinition)
            const x = transition("x", delta.x)
            const y = transition("y", delta.y)

            // Force a render now rather than waiting for the next render loop
            styler(ref.current as HTMLElement).render()

            if (transitionDefinition) {
                controls.start({ x: 0, y: 0, transition: { x, y } })
            }
        }
    })
}

export const Position: FunctionalComponentDefinition = {
    shouldRender: (props: MotionProps) => !!props.positionTransition,
    component: makeHookComponent(
        ({
            innerRef,
            controls,
            values,
            positionTransition,
        }: FunctionalProps) => {
            return usePositionAnimation(
                innerRef,
                values,
                controls,
                positionTransition
            )
        }
    ),
}
