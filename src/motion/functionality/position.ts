import { MotionProps, AnimationProps } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { useRef, useLayoutEffect, RefObject, useEffect } from "react"
import { ValueAnimationControls } from "animation/ValueAnimationControls"
import { MotionValuesMap } from "motion/utils/use-motion-values"

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
    element instanceof HTMLElement

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

    value.set(offset + value.get(), false)

    return transition
}

function usePositionAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    positionTransition: AnimationProps["positionTransition"]
) {
    const previousPos = useRef<Position | null>(null)
    const targetPos = useRef<Position>({ left: 0, top: 0 })

    const updateTarget = () => {
        const element = ref.current
        if (!isHTMLElement(element)) return

        targetPos.current = {
            top: element.offsetTop,
            left: element.offsetLeft,
        }
    }

    useLayoutEffect(() => {
        updateTarget()
        const prev = previousPos.current
        const target = targetPos.current

        if (prev !== null && hasMoved(prev, target)) {
            const delta = measureDelta(prev, target)
            const transition = createTransition(values, positionTransition)
            const x = transition("x", delta.left)
            const y = transition("y", delta.top)

            controls.start({ x: 0, y: 0, transition: { x, y } })
        }

        previousPos.current = targetPos.current
    })

    // On initial render, measure initial offset. We do this with a useEffect because
    // of the specific order that `motion` components initialise.
    useEffect(() => {
        updateTarget()
        previousPos.current = targetPos.current
    }, [])
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
