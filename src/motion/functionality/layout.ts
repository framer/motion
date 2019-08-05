import { MotionProps, AnimationProps, ResolveLayoutTransition } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { useLayoutEffect, RefObject, useContext } from "react"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import styler from "stylefire"
import { Transition, TargetAndTransition } from "../../types"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { useSyncEffect } from "utils/use-sync-layout-effect"

function isHTMLElement(
    element?: Element | HTMLElement | null
): element is HTMLElement {
    return element instanceof HTMLElement
}

interface Layout {
    left: number
    top: number
    width: number
    height: number
}

interface BoundingBox extends Layout {
    right: number
    bottom: number
}

function findCenter({ top, left, bottom, right }: BoundingBox) {
    return {
        x: (left + right) / 2,
        y: (top + bottom) / 2,
    }
}

function isResolver(
    transition: AnimationProps["layoutTransition"]
): transition is ResolveLayoutTransition {
    return typeof transition === "function"
}

function hasChanged(prev: Layout | BoundingBox, next: Layout | BoundingBox) {
    return (
        prev.left !== next.left ||
        prev.top !== next.top ||
        prev.height !== next.height ||
        prev.width !== next.width
    )
}

function measureDelta(prev: Layout, next: Layout) {
    return {
        left: prev.left - next.left,
        top: prev.top - next.top,
        width: prev.width - next.width,
        height: prev.height - next.height,
    }
}

function measureLayout(element?: Element | HTMLElement | null): Layout | null {
    if (!isHTMLElement(element)) return null

    // Measure the *actual* size to check whether the element has changed layout
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = element

    return {
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
    }
}

function measureBoundingBox(
    element?: Element | HTMLElement | null
): BoundingBox | null {
    if (!isHTMLElement(element)) return null

    const {
        left,
        top,
        width,
        height,
        bottom,
        right,
    } = element.getBoundingClientRect()
    return { left, top, width, height, bottom, right }
}

function measureBoundingBoxWithoutTransform(element: HTMLElement): BoundingBox {
    // TODO: This is a source of layout thrashing
    const transform = element.style.transform
    element.style.transform = ""
    const layout = measureBoundingBox(element) as BoundingBox
    element.style.transform = transform

    return layout
}

function measurePositionStyle(element?: Element | HTMLElement | null) {
    if (!isHTMLElement(element)) return null

    return window.getComputedStyle(element).position
}

interface VisualInfo {
    layout: Layout | null
    bbox: Layout | null
    position: string | null
}

function useLayoutAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    layoutTransition: AnimationProps["layoutTransition"]
) {
    // Allow any parent SyncLayoutContext components to force-update this component
    useContext(SyncLayoutContext)

    const element = ref.current
    const shouldMeasureLayout = isHTMLElement(element)

    const hasChanged = {
        left: false,
        top: false,
        width: false,
        height: false,
    }

    const next: VisualInfo = {
        layout: null,
        bbox: null,
        position: null,
    }

    const prev: VisualInfo = shouldMeasureLayout
        ? {
              layout: measureLayout(element),
              bbox: measureBoundingBox(element),
              position: measurePositionStyle(element),
          }
        : next

    let transform: string | null = ""

    // We split the unsetting, read and reapplication of the `transform` style prop
    // as multiple components might all be doing the same thing. Doing it this way
    // will prevent layout thrashing.
    useSyncEffect.prepare(() => {
        if (!shouldMeasureLayout) return

        transform = element.style.transform
        element.style.transform = ""
    })

    useSyncEffect.read(() => {
        if (!shouldMeasureLayout) return

        next.layout = measureLayout(element)
        next.bbox = measureBoundingBox(element) as BoundingBox
        next.position = measurePositionStyle(element)
    })

    useSyncEffect.render(() => {
        if (!shouldMeasureLayout) return

        element.style.transform = transform

        // if (!hasChanged(prevBbox, next)) return

        // const delta = measureDelta(prevBbox, next)

        // const transitionDefinition = isResolver(layoutTransition)
        //     ? layoutTransition({ delta })
        //     : layoutTransition

        // const target: TargetAndTransition = {}
        // const transition: Transition = {}

        // function makeTransition(
        //     layoutKey: keyof Layout,
        //     transformKey: string,
        //     defaultValue: number,
        //     visualOrigin: number
        // ) {
        //     // If layout hasn't changed, early return
        //     if (!delta[layoutKey]) return

        //     const baseTransition =
        //         typeof transitionDefinition === "boolean"
        //             ? {}
        //             : transitionDefinition

        //     const value = values.get(transformKey, defaultValue)
        //     const velocity = value.getVelocity()
        //     transition[transformKey] = baseTransition.hasOwnProperty(
        //         transformKey
        //     )
        //         ? baseTransition[transformKey]
        //         : baseTransition

        //     if (transition[transformKey].velocity === undefined) {
        //         transition[transformKey].velocity = velocity
        //     }

        //     target[transformKey] = defaultValue

        //     value.set(visualOrigin)
        // }

        // if (transitionDefinition) {
        //     const prevCenter = findCenter(prev)
        //     const nextCenter = findCenter(next)

        //     makeTransition("left", "x", 0, prevCenter.x - nextCenter.x)
        //     makeTransition("top", "y", 0, prevCenter.y - nextCenter.y)
        //     makeTransition("width", "scaleX", 1, prev.width / next.width)
        //     makeTransition("height", "scaleY", 1, prev.height / next.height)

        //     target.transition = transition
        //     controls.start(target)
        // }

        styler(element).render()
    })
}

export const Layout: FunctionalComponentDefinition = {
    key: "layout",
    shouldRender: (props: MotionProps) =>
        typeof window !== "undefined" &&
        (!!props.positionTransition || !!props.layoutTransition),
    Component: makeHookComponent(
        ({
            innerRef,
            controls,
            values,
            positionTransition,
            layoutTransition,
        }: FunctionalProps) => {
            useLayoutAnimation(
                innerRef,
                values,
                controls,
                layoutTransition || positionTransition
            )
        }
    ),
}
