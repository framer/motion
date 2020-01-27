import * as React from "react"
import styler from "stylefire"
import { invariant } from "hey-listen"
import { MotionProps, AnimationProps, ResolveLayoutTransition } from "../types"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { layoutSync } from "../../utils/use-layout-sync"
import { TargetAndTransition, Transition } from "../../types"
import { isHTMLElement } from "../../utils/is-html-element"
import { underDampedSpring } from "../../animation/utils/default-transitions"
import { syncRenderSession } from "../../dom/sync-render-session"

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

function getDefaultLayoutTransition(isPositionOnly: boolean) {
    return isPositionOnly ? defaultPositionTransition : defaultLayoutTransition
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

const axisLabels: { x: XLabels; y: YLabels } = {
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

function calcAxisDelta(prev: Layout, next: Layout, names: XLabels): XDelta
function calcAxisDelta(prev: Layout, next: Layout, names: YLabels): YDelta
function calcAxisDelta(
    prev: Layout,
    next: Layout,
    names: XLabels | YLabels
): XDelta | YDelta {
    const sizeDelta = prev[names.size] - next[names.size]
    let origin = 0.5

    // If the element has changed size we want to check whether either side is in
    // the same position before/after the layout transition. If so, we can anchor
    // the element to that position and only animate its size.
    if (sizeDelta) {
        if (prev[names.min] === next[names.min]) {
            origin = 0
        } else if (prev[names.max] === next[names.max]) {
            origin = 1
        }
    }

    const delta = {
        [names.size]: sizeDelta,
        [names.origin]: origin,
        [names.id]:
            // Only measure a position delta if we haven't anchored to one side
            origin === 0.5
                ? centerOf(prev[names.min], prev[names.max]) -
                  centerOf(next[names.min], next[names.max])
                : 0,
    }

    return delta as any
}

function calcDelta(prev: Layout, next: Layout): LayoutDelta {
    const delta = {
        ...calcAxisDelta(prev, next, axisLabels.x),
        ...calcAxisDelta(prev, next, axisLabels.y),
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
    isPositionOnly: boolean
): LayoutType {
    return isPositionOnly && prev === next ? offset : boundingBox
}

function isSizeKey(key: string) {
    return key === "width" || key === "height"
}

interface LayoutProps {
    positionTransition?: boolean
    layoutTransition?: boolean
}

function getTransition({ layoutTransition, positionTransition }: LayoutProps) {
    return layoutTransition || positionTransition
}

export class LayoutAnimation extends React.Component<
    FunctionalProps & LayoutProps
> {
    static contextType = SyncLayoutContext

    // Measure the current state of the DOM before it's updated, and schedule checks to see
    // if it's changed as a result of a React render.
    getSnapshotBeforeUpdate() {
        const { innerRef, positionTransition, values, controls } = this.props
        const element = innerRef.current

        if (!isHTMLElement(element)) return

        const layoutTransition = getTransition(this.props) as boolean
        const isPositionOnly = !!positionTransition

        const positionStyle = readPositionStyle(element)
        const prev: VisualInfo = {
            offset: offset.measure(element),
            boundingBox: boundingBox.measure(element),
        }

        let transform: string | null
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
            compare = getLayoutType(positionStyle, nextPosition, isPositionOnly)
        })

        layoutSync.render(() => {
            // Reverse the layout delta of all newly laid-out layoutTransition components into their
            // prev visual state and then animate them into their new one using transforms.
            const prevLayout = compare.getLayout(prev)
            const nextLayout = compare.getLayout(next)
            const delta = calcDelta(prevLayout, nextLayout)
            const hasAnyChanged =
                delta.x || delta.y || delta.width || delta.height

            if (!hasAnyChanged) {
                // If layout hasn't changed, reapply the transform and get out of here.
                transform && (element.style.transform = transform)
                return
            }

            styler(element).set({
                originX: delta.originX,
                originY: delta.originY,
            })
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
                        ? { ...getDefaultLayoutTransition(isPositionOnly) }
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
                    !isSizeKey(layoutKey) && compare === offset
                        ? value.get()
                        : 0

                value.set(visualOrigin + offsetToApply)
            }

            makeTransition("left", "x", 0, delta.x)
            makeTransition("top", "y", 0, delta.y)

            if (!isPositionOnly) {
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

        return null
    }

    componentDidUpdate() {
        layoutSync.flush()
    }

    render() {
        return null
    }
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
    Component: LayoutAnimation,
}
