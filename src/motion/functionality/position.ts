import { MotionProps, AnimationProps } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { useLayoutEffect, RefObject } from "react"
import { ValueAnimationControls } from "animation/ValueAnimationControls"
import { MotionValuesMap } from "motion/utils/use-motion-values"
import styler from "stylefire"

interface Position {
    top: number
    left: number
}

const hasMoved = (a: Position, b: Position) =>
    a.top !== b.top || a.left !== b.left

const measureDelta = (origin: Position, target: Position) => ({
    left: origin.left - target.left,
    top: origin.top - target.top,
})

const isHTMLElement = (element: Element | null): element is HTMLElement =>
    typeof HTMLElement !== "undefined" && element instanceof HTMLElement

const createTransition = (
    values: MotionValuesMap,
    positionTransition: AnimationProps["positionTransition"] = {}
) => (axis: "x" | "y", offset: number) => {
    const baseTransition = positionTransition === true ? {} : positionTransition
    const value = values.get(axis, 0)
    const velocity = value.getVelocity()
    const transition = baseTransition.hasOwnProperty(axis)
        ? baseTransition[axis]
        : baseTransition

    if (transition.velocity === undefined) transition.velocity = velocity

    value.set(offset + value.get())

    return transition
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
            ? { top: element.offsetTop, left: element.offsetLeft }
            : null
    }

    // Take a record of the current bounding box
    let prev = getPosition()

    useLayoutEffect(() => {
        const target = getPosition()

        if (prev && target && hasMoved(prev, target)) {
            const delta = measureDelta(prev, target)
            const transition = createTransition(values, positionTransition)
            const x = transition("x", delta.left)
            const y = transition("y", delta.top)

            // Force a render now rather than waiting for the next render loop
            styler(ref.current as HTMLElement).render()

            controls.start({ x: 0, y: 0, transition: { x, y } })
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
