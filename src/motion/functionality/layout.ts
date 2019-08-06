import { RefObject, useContext } from "react"
import styler from "stylefire"
import { MotionProps, AnimationProps, ResolveLayoutTransition } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { useSyncEffect } from "../../utils/use-sync-layout-effect"
import { TargetAndTransition, Transition } from "../../types"

interface Layout {
    left: number
    top: number
    width: number
    height: number
}

interface CompareMode {
    measure: (element: HTMLElement) => Layout
    getLayout: (info: VisualInfo) => Layout
}

interface VisualInfo {
    offset: Layout
    boundingBox: Layout
}

function isHTMLElement(
    element?: Element | HTMLElement | null
): element is HTMLElement {
    return element instanceof HTMLElement
}

function isResolver(
    transition: AnimationProps["layoutTransition"]
): transition is ResolveLayoutTransition {
    return typeof transition === "function"
}

function findCenter({ top, left, width, height }: Layout) {
    const right = left + width
    const bottom = top + height
    return {
        x: (left + right) / 2,
        y: (top + bottom) / 2,
    }
}

function measureDelta(prev: Layout, next: Layout) {
    const prevCenter = findCenter(prev)
    const nextCenter = findCenter(next)

    return {
        left: prevCenter.x - nextCenter.x,
        top: prevCenter.y - nextCenter.y,
        width: prev.width - next.width,
        height: prev.height - next.height,
    }
}

const offset: CompareMode = {
    getLayout: ({ offset }) => offset,
    measure: element => {
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = element

        return {
            left: offsetLeft,
            top: offsetTop,
            width: offsetWidth,
            height: offsetHeight,
        }
    },
}
const boundingBox: CompareMode = {
    getLayout: ({ boundingBox }) => boundingBox,
    measure: element => {
        const { left, top, width, height } = element.getBoundingClientRect()
        return { left, top, width, height }
    },
}

function readPositionStyle(element: HTMLElement) {
    return window.getComputedStyle(element).position
}

function getCompareMode(prev: string | null, next: string | null): CompareMode {
    return prev === next ? offset : boundingBox
}

function isSizeKey(key: string) {
    return key === "width" || key === "height"
}

function useLayoutAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    layoutTransition: boolean | Transition | ResolveLayoutTransition
) {
    // Allow any parent SyncLayoutContext components to force-update this component
    useContext(SyncLayoutContext)

    const element = ref.current

    if (!isHTMLElement(element)) {
        // If we don't yet have a HTML element we can early return here. These jobs
        // won't get scheduled, but because they're hooks they do need to be called.
        useSyncEffect.prepare()
        useSyncEffect.read()
        useSyncEffect.render()
        return
    }

    const prevPosition = readPositionStyle(element)

    const prev: VisualInfo = {
        offset: offset.measure(element),
        boundingBox: boundingBox.measure(element),
    }

    let transform: string | null = ""
    let next: VisualInfo
    let compare: CompareMode

    const prepare = () => {
        transform = element.style.transform
        element.style.transform = ""
    }

    const read = () => {
        next = {
            offset: offset.measure(element),
            boundingBox: boundingBox.measure(element),
        }

        const nextPosition = readPositionStyle(element)
        compare = getCompareMode(prevPosition, nextPosition)
    }

    const render = () => {
        const prevLayout = compare.getLayout(prev)
        const nextLayout = compare.getLayout(next)
        const delta = measureDelta(prevLayout, nextLayout)
        const hasAnyChanged =
            delta.top || delta.left || delta.width || delta.height

        if (!hasAnyChanged) {
            transform && (element.style.transform = transform)
            return
        }

        const target: TargetAndTransition = {}
        const transition: Transition = {}

        const transitionDefinition = isResolver(layoutTransition)
            ? layoutTransition({ delta })
            : layoutTransition

        function makeTransition(
            layoutKey: keyof Layout,
            transformKey: string,
            defaultValue: number,
            visualOrigin: number
        ) {
            if (!delta[layoutKey]) return

            const baseTransition =
                typeof transitionDefinition === "boolean"
                    ? {}
                    : transitionDefinition

            const value = values.get(transformKey, defaultValue)
            const velocity = value.getVelocity()

            transition[transformKey] = baseTransition[transformKey]
                ? { ...baseTransition[transformKey] }
                : { ...baseTransition }

            if (transition[transformKey].velocity === undefined) {
                transition[transformKey].velocity = velocity || 0
            }

            target[transformKey] = defaultValue

            let offsetToApply = 0

            if (!isSizeKey(layoutKey) && compare === offset) {
                offsetToApply = value.get()
            }

            value.set(visualOrigin + offsetToApply)
        }

        makeTransition("left", "x", 0, delta.left)
        makeTransition("top", "y", 0, delta.top)
        makeTransition(
            "width",
            "scaleX",
            1,
            prev.boundingBox.width / next.boundingBox.width
        )
        makeTransition(
            "height",
            "scaleY",
            1,
            prev.boundingBox.height / next.boundingBox.height
        )

        target.transition = transition

        transitionDefinition && controls.start(target)

        styler(element).render()
    }

    // We split the unsetting, read and reapplication of the `transform` style prop into
    // different steps via useSyncEffect. Multiple components might all be doing the same
    // thing and by splitting these jobs and flushing them in batches we prevent layout thrashing.
    useSyncEffect.prepare(prepare)
    useSyncEffect.read(read)
    useSyncEffect.render(render)
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
                (layoutTransition as any) || (positionTransition as any)
            )
        }
    ),
}
