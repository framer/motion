import { MotionProps, AnimationProps } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { useRef, useLayoutEffect, RefObject, useEffect } from "react"
import { ValueAnimationControls } from "animation/ValueAnimationControls"
import { MotionValuesMap } from "motion/utils/use-motion-values"

interface BBox {
    top: number
    left: number
}

const hasMoved = (a: BBox, b: BBox) => a.top !== b.top || a.left !== b.left

const getDelta = (origin: BBox, target: BBox) => ({
    left: origin.left - target.left,
    top: origin.top - target.top,
})

function isHTMLElement(element: Element | null): element is HTMLElement {
    return element instanceof HTMLElement
}

function usePositionAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    positionTransition: AnimationProps["positionTransition"]
) {
    const previousPos = useRef<BBox | null>(null)
    const targetPos = useRef<BBox>({ left: 0, top: 0 })

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
            const delta = getDelta(prev, target)
            const x = values.get("x", 0)
            const y = values.get("y", 0)
            // TODO: Need to reset velocity here for spring animations
            x.set(delta.left + x.get(), false)
            y.set(delta.top + y.get(), false)
            controls.start({ x: 0, y: 0, transition: positionTransition })
        }

        previousPos.current = targetPos.current
    })

    // On initial render, measure initial offset
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
