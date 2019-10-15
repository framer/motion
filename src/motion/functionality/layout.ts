import { RefObject, useContext } from "react"
import { invariant } from "hey-listen"
import { MotionProps, AnimationProps, ResolveLayoutTransition } from "../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { layoutSync, useLayoutSync } from "../../utils/use-layout-sync"
import { TargetAndTransition, Transition } from "../../types"
import { isHTMLElement } from "../../utils/is-html-element"
import { underDampedSpring } from "../../animation/utils/default-transitions"
import { syncRenderSession } from "../../dom/sync-render-session"
import styler from "stylefire"

interface Layout {
    top: number
    left: number
    right: number
    bottom: number
    width: number
    height: number
}

interface XDelta {
    x: number
    originX: number
    width: number
}

interface YDelta {
    y: number
    originY: number
    height: number
}

// We measure the positional delta as x/y as we're actually going to figure out
// and track the motion of the component's visual center.
interface LayoutDelta extends XDelta, YDelta {}

// We use both offset and bounding box measurements, and they need to be handled slightly differently
interface LayoutType {
    measure: (element: HTMLElement) => Layout
    getLayout: (info: VisualInfo) => Layout
}

interface VisualInfo {
    offset: Layout
    boundingBox: Layout
}

const defaultLayoutTransition = {
    duration: 0.8,
    ease: [0.45, 0.05, 0.19, 1.0],
}

const defaultPositionTransition = underDampedSpring()

function getDefaultLayoutTransition(positionOnly: boolean) {
    return positionOnly ? defaultPositionTransition : defaultLayoutTransition
}

function isResolver(
    transition: AnimationProps["layoutTransition"]
): transition is ResolveLayoutTransition {
    return typeof transition === "function"
}

interface XLabels {
    id: "x"
    size: "width"
    min: "left"
    max: "right"
    origin: "originX"
}

interface YLabels {
    id: "y"
    size: "height"
    min: "top"
    max: "bottom"
    origin: "originY"
}

const dimensionLabels: { x: XLabels; y: YLabels } = {
    x: {
        id: "x",
        size: "width",
        min: "left",
        max: "right",
        origin: "originX",
    },
    y: {
        id: "y",
        size: "height",
        min: "top",
        max: "bottom",
        origin: "originY",
    },
}

function centerOf(min: number, max: number) {
    return (min + max) / 2
}

function calcDimensionDelta(prev: Layout, next: Layout, names: XLabels): XDelta
function calcDimensionDelta(prev: Layout, next: Layout, names: YLabels): YDelta
function calcDimensionDelta(
    prev: Layout,
    next: Layout,
    names: XLabels | YLabels
): XDelta | YDelta {
    const sizeDelta = prev[names.size] - next[names.size]
    let origin = 0.5

    if (sizeDelta) {
        if (prev[names.min] === next[names.max]) {
            origin = 0
        } else if (prev[names.max] === next[names.max]) {
            origin = 1
        }
    }

    const delta = {
        [names.size]: sizeDelta,
        [names.origin]: origin,
        [names.id]:
            origin === 0.5
                ? centerOf(prev[names.min], prev[names.max]) -
                  centerOf(next[names.min], next[names.max])
                : 0,
    }

    return delta as any
}

function calcDelta(prev: Layout, next: Layout): LayoutDelta {
    const delta = {
        ...calcDimensionDelta(prev, next, dimensionLabels.x),
        ...calcDimensionDelta(prev, next, dimensionLabels.y),
    }

    return delta as LayoutDelta
}

const offset: LayoutType = {
    getLayout: ({ offset }) => offset,
    measure: element => {
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = element

        return {
            left: offsetLeft,
            top: offsetTop,
            right: offsetLeft + offsetWidth,
            bottom: offsetTop + offsetHeight,
            width: offsetWidth,
            height: offsetHeight,
        }
    },
}
const boundingBox: LayoutType = {
    getLayout: ({ boundingBox }) => boundingBox,
    measure: element => {
        const {
            left,
            top,
            width,
            height,
            right,
            bottom,
        } = element.getBoundingClientRect()
        return { left, top, width, height, right, bottom }
    },
}

function readPositionStyle(element: HTMLElement) {
    return window.getComputedStyle(element).position
}

function getLayoutType(
    prev: string | null,
    next: string | null,
    positionOnly: boolean
): LayoutType {
    return positionOnly && prev === next ? offset : boundingBox
}

function isSizeKey(key: string) {
    return key === "width" || key === "height"
}

function useLayoutAnimation(
    ref: RefObject<Element | HTMLElement | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls,
    layoutTransition: boolean | Transition | ResolveLayoutTransition,
    positionOnly: boolean = false
) {
    // Allow any parent SyncLayoutContext components to force-update this component
    useContext(SyncLayoutContext)

    const element = ref.current

    useLayoutSync()

    // If we don't have a HTML element we can early return here. We've already called all the hooks.
    if (!isHTMLElement(element)) return

    // Keep track of the position style prop. Ideally we'd compare offset as this is uneffected by
    // the same transforms that we want to use to performantly animate the layout. But if position changes,
    // for example between "static" and "fixed", we can no longer rely on the offset and need
    // to use the visual bounding box.
    const prevPosition = readPositionStyle(element)

    const prev: VisualInfo = {
        offset: offset.measure(element),
        boundingBox: boundingBox.measure(element),
    }

    // Keep track of any existing transforms so we can reapply them after measuring the target bounding box.
    let transform: string | null = ""

    let next: VisualInfo
    let compare: LayoutType

    // We split the unsetting, read and reapplication of the `transform` style prop into
    // different steps via useSyncEffect. Multiple components might all be doing the same
    // thing and by splitting these jobs and flushing them in batches we prevent layout thrashing.
    layoutSync.prepare(() => {
        // Unset the transform of all layoutTransition components so we can accurately measure
        // the target bounding box
        transform = element.style.transform
        element.style.transform = ""
    })

    layoutSync.read(() => {
        // Read the target VisualInfo of all layoutTransition components
        next = {
            offset: offset.measure(element),
            boundingBox: boundingBox.measure(element),
        }

        const nextPosition = readPositionStyle(element)
        compare = getLayoutType(prevPosition, nextPosition, positionOnly)
    })

    layoutSync.render(() => {
        // Reverse the layout delta of all newly laid-out layoutTransition components into their
        // prev visual state and then animate them into their new one using transforms.
        const prevLayout = compare.getLayout(prev)
        const nextLayout = compare.getLayout(next)
        const delta = calcDelta(prevLayout, nextLayout)
        const hasAnyChanged = delta.x || delta.y || delta.width || delta.height

        if (!hasAnyChanged) {
            // If layout hasn't changed, reapply the transform and get out of here.
            transform && (element.style.transform = transform)
            return
        }

        styler(element).set({ originX: delta.originX, originY: delta.originY })
        syncRenderSession.open()

        const target: TargetAndTransition = {}
        const transition: Transition = {}

        const transitionDefinition = isResolver(layoutTransition)
            ? layoutTransition({ delta })
            : layoutTransition

        function makeTransition(
            layoutKey: keyof Layout,
            transformKey: string,
            targetValue: number,
            visualOrigin: number
        ) {
            // If this dimension hasn't changed, early return
            const deltaKey = isSizeKey(layoutKey) ? layoutKey : transformKey
            if (!delta[deltaKey]) return

            const baseTransition =
                typeof transitionDefinition === "boolean"
                    ? { ...getDefaultLayoutTransition(positionOnly) }
                    : transitionDefinition

            const value = values.get(transformKey, targetValue)
            const velocity = value.getVelocity()

            transition[transformKey] = baseTransition[transformKey]
                ? { ...baseTransition[transformKey] }
                : { ...baseTransition }

            if (transition[transformKey].velocity === undefined) {
                transition[transformKey].velocity = velocity || 0
            }

            // The target value of all transforms is the default value of that prop (ie x = 0, scaleX = 1)
            // This is because we're inverting the layout change with `transform` and then animating to `transform: none`
            target[transformKey] = targetValue

            const offsetToApply =
                !isSizeKey(layoutKey) && compare === offset ? value.get() : 0

            value.set(visualOrigin + offsetToApply)
        }

        makeTransition("left", "x", 0, delta.x)
        makeTransition("top", "y", 0, delta.y)

        if (!positionOnly) {
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
        }

        target.transition = transition

        // Only start the transition if `transitionDefinition` isn't `false`. Otherwise we want
        // to leave the values in their newly-inverted state and let the user cope with the rest.
        transitionDefinition && controls.start(target)

        // Force a render to ensure there's no visual flickering
        syncRenderSession.flush()
    })
}

export const Layout: FunctionalComponentDefinition = {
    key: "layout",
    shouldRender: ({ positionTransition, layoutTransition }: MotionProps) => {
        invariant(
            !(positionTransition && layoutTransition),
            `Don't set both positionTransition and layoutTransition on the same component`
        )

        return (
            typeof window !== "undefined" &&
            !!(positionTransition || layoutTransition)
        )
    },
    Component: makeRenderlessComponent(
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
                (layoutTransition as any) || (positionTransition as any),
                !!positionTransition
            )
        }
    ),
}
