import {
    MotionProps,
    AnimationProps,
    ResolvePositionTransition,
} from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import {
    useLayoutEffect,
    useEffect,
    RefObject,
    useContext,
    useRef,
} from "react"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import styler from "stylefire"
import { Transition, TargetAndTransition } from "../../types"
import { SyncLayoutContext } from "../../components/SyncLayout"

// interface Position {
//     x: number
//     y: number
// }

// const hasMoved = (a: Position, b: Position) => a.x !== b.x || a.y !== b.y

// const measureDelta = (origin: Position, target: Position) => ({
//     x: origin.x - target.x,
//     y: origin.y - target.y,
// })

// const isHTMLElement = (element: Element | null): element is HTMLElement =>
//     typeof HTMLElement !== "undefined" && element instanceof HTMLElement

// const createTransition = (
//     values: MotionValuesMap,
//     positionTransition: Transition | boolean = {}
// ) => (axis: "x" | "y", offset: number) => {
//     const baseTransition =
//         typeof positionTransition === "boolean" ? {} : positionTransition
//     const value = values.get(axis, 0)
//     const velocity = value.getVelocity()
//     const transition = baseTransition.hasOwnProperty(axis)
//         ? baseTransition[axis]
//         : baseTransition

//     if (transition.velocity === undefined) transition.velocity = velocity

//     value.set(offset + value.get())

//     return transition
// }

// const createSizeTransition = (
//     values: MotionValuesMap,
//     sizeTransition: Transition | boolean = {}
// ) => (axis: "scaleX" | "scaleY", origin: number) => {
//     const baseTransition =
//         typeof sizeTransition === "boolean" ? {} : sizeTransition
//     const value = values.get(axis, 1)
//     const velocity = value.getVelocity()
//     const transition = baseTransition.hasOwnProperty(axis)
//         ? baseTransition[axis]
//         : baseTransition

//     if (transition.velocity === undefined) transition.velocity = velocity

//     value.set(origin)

//     return transition
// }

// function usePositionAnimation(
//     ref: RefObject<Element | HTMLElement | null>,
//     values: MotionValuesMap,
//     controls: ValueAnimationControls,
//     positionTransition: AnimationProps["positionTransition"]
// ) {
//     const getPosition = () => {
//         const element = ref.current

//         return isHTMLElement(element)
//             ? { x: element.offsetLeft, y: element.offsetTop }
//             : null
//     }

//     // Take a record of the current bounding box
//     let prev = getPosition()

//     useLayoutEffect(() => {
//         const target = getPosition()

//         if (!prev || !target || !hasMoved(prev, target)) return
//         console.log(prev, target)
//         const delta = measureDelta(prev, target)

//         const transitionDefinition = isResolver(positionTransition)
//             ? positionTransition({ delta })
//             : positionTransition

//         const transition = createTransition(values, transitionDefinition)
//         const x = transition("x", delta.x)
//         const y = transition("y", delta.y)

//         if (transitionDefinition) {
//             controls.start({ x: 0, y: 0, transition: { x, y } })
//         }
//     })
// }

// interface Size {
//     width: number
//     height: number
// }

// function hasResized(a: Size, b: Size) {
//     return a.width !== b.width || a.height !== b.height
// }

// const measureSizeDelta = (origin: Size, target: Size) => ({
//     width: origin.width - target.width,
//     height: origin.height - target.height,
// })

// function useSizeAnimation(
//     ref: RefObject<Element | HTMLElement | null>,
//     values: MotionValuesMap,
//     controls: ValueAnimationControls,
//     sizeTransition: AnimationProps["layoutTransition"]
// ) {
//     const getSize = () => {
//         const element = ref.current

//         if (!isHTMLElement(element)) return null

//         const { width, height } = element.getBoundingClientRect()

//         return { width, height }
//     }

//     // Take a record of the current bounding box
//     let prev = getSize()

//     useLayoutEffect(() => {
//         const element = ref.current
//         if (!isHTMLElement(element)) return undefined

//         // Undo transform when measuring target
//         const transform = element.style.transform
//         element.style.transform = ""
//         const target = getSize()
//         element.style.transform = transform

//         if (!prev || !target || !hasResized(prev, target)) return

//         const delta = measureSizeDelta(prev, target)

//         const transitionDefinition = isResolver(sizeTransition)
//             ? sizeTransition({ delta })
//             : sizeTransition

//         const transition = createSizeTransition(values, transitionDefinition)

//         const scaleX = transition("scaleX", prev.width / target.width)
//         const scaleY = transition("scaleY", prev.height / target.height)

//         if (transitionDefinition) {
//             controls.start({
//                 scaleX: 1,
//                 scaleY: 1,
//                 transition: { scaleX, scaleY },
//             })
//         }
//     })
// }

function isHTMLElement(
    element?: Element | HTMLElement | null
): element is HTMLElement {
    return element instanceof HTMLElement
}

interface BoundingBox {
    top: number
    left: number
    right: number
    bottom: number
}

interface Layout {
    left: number
    top: number
    width: number
    height: number
}

function findCenter({ top, left, bottom, right }: BoundingBox) {
    return {
        x: (left + right) / 2,
        y: (top + bottom) / 2,
    }
}

function isResolver(
    transition: AnimationProps["layoutTransition"]
): transition is ResolvePositionTransition {
    return typeof transition === "function"
}

function hasChanged(prev: Layout, next: Layout) {
    return (
        prev.left !== next.left ||
        prev.top !== next.top ||
        prev.height !== next.height ||
        prev.width !== next.width
    )
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

function measureDelta(prev: Layout, next: Layout) {
    return {
        left: prev.left - next.left,
        top: prev.top - next.top,
        width: prev.width - next.width,
        height: prev.height - next.height,
    }
}

function measureBoundingBox(
    element?: Element | HTMLElement | null
): Layout | null {
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

function measureBoundingBoxWithoutTransform(element: HTMLElement): Layout {
    const transform = element.style.transform
    element.style.transform = ""
    const layout = measureBoundingBox(element) as Layout
    element.style.transform = transform

    return layout
}

function useLayoutAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    layoutTransition: AnimationProps["layoutTransition"]
) {
    // Allow any parent SyncLayoutContexts to force-update this component
    useContext(SyncLayoutContext)

    const prev = measureBoundingBox(ref.current)

    useLayoutEffect(() => {
        const element = ref.current
        if (!isHTMLElement(element) || !prev) return

        const next = measureBoundingBoxWithoutTransform(element)

        if (!hasChanged(prev, next)) return

        const delta = measureDelta(prev, next)

        const transitionDefinition = isResolver(layoutTransition)
            ? layoutTransition({ delta })
            : layoutTransition

        const target: TargetAndTransition = {}
        const transition: Transition = {}

        function makeTransition(
            layoutKey: keyof Layout,
            transformKey: string,
            defaultValue: number,
            visualOrigin: number
        ) {
            // If layout hasn't changed, early return
            if (!delta[layoutKey]) return

            const baseTransition =
                typeof transitionDefinition === "boolean"
                    ? {}
                    : transitionDefinition

            const value = values.get(transformKey, defaultValue)
            const velocity = value.getVelocity()
            transition[transformKey] = baseTransition.hasOwnProperty(
                transformKey
            )
                ? baseTransition[transformKey]
                : baseTransition

            if (transition[transformKey].velocity === undefined) {
                transition[transformKey].velocity = velocity
            }

            target[transformKey] = defaultValue

            value.set(visualOrigin)
        }

        if (transitionDefinition) {
            const prevCenter = findCenter(prev)
            const nextCenter = findCenter(next)

            makeTransition("left", "x", 0, prevCenter.x - nextCenter.x)
            makeTransition("top", "y", 0, prevCenter.y - nextCenter.y)
            makeTransition("width", "scaleX", 1, prev.width / next.width)
            makeTransition("height", "scaleY", 1, prev.height / next.height)

            target.transition = transition
            controls.start(target)
        }

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
