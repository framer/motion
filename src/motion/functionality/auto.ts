import * as React from "react"
import { invariant, warning } from "hey-listen"
import { MotionProps, AnimationProps, ResolveLayoutTransition } from "../types"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { SyncLayoutContext } from "../../components/SyncLayout"
import { sync, flush } from "../../utils/layout-sync"
import { TargetAndTransition, Transition } from "../../types"
import { isHTMLElement } from "../../utils/is-html-element"
import { underDampedSpring } from "../../animation/utils/default-transitions"
import { syncRenderSession } from "../../dom/sync-render-session"
import { NativeElement } from "../utils/use-native-element"
import { motionValue } from "value"
import { MotionValuesMap } from "motion/utils/use-motion-values"

/**
 * TODO:
 * Handle scale
 * Handle borderRadius invert scaling
 * Handle borderRadius unit conversion
 * Handle individual border radius
 * Account for parent transform
 * Apply transition to styles
 */

interface Layout {
    top: number
    left: number
    right: number
    bottom: number
    width: number
    height: number
}

interface AutoProps {
    positionTransition?: boolean
    layoutTransition?: boolean
    layoutId?: string
    auto?: boolean
}

export interface XDelta {
    x: number
    originX: number
    scaleX: number
    // TODO: Check if we still use width and height outside of scale calculation
    width: number
}

export interface YDelta {
    y: number
    originY: number
    scaleY: number
    height: number
}

// We measure the positional delta as x/y as we're actually going to figure out
// and track the motion of the component's visual center.
export interface LayoutDelta extends XDelta, YDelta {}

// We use both offset and bounding box measurements, and they need to be handled slightly differently
interface LayoutType {
    measure: (element: HTMLElement) => Layout
    getLayout: (info: VisualInfo) => Layout
}

interface VisualInfo {
    offset: Layout
    boundingBox: Layout
    style: {
        position: string
        opacity: number
        color: string
        backgroundColor: string
        borderRadius: number
    }
}

interface XLabels {
    id: "x"
    size: "width"
    min: "left"
    max: "right"
    origin: "originX"
    scale: "scaleX"
}

interface YLabels {
    id: "y"
    size: "height"
    min: "top"
    max: "bottom"
    origin: "originY"
    scale: "scaleY"
}

// TODO: Would there be any benefits of moving this to context?
const layoutContinuity = new Map<string, VisualInfo>()

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

const axisLabels: { x: XLabels; y: YLabels } = {
    x: {
        id: "x",
        size: "width",
        min: "left",
        max: "right",
        origin: "originX",
        scale: "scaleX",
    },
    y: {
        id: "y",
        size: "height",
        min: "top",
        max: "bottom",
        origin: "originY",
        scale: "scaleY",
    },
}

const autoKey = "auto"

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
        [names.scale]: prev[names.size] / next[names.size],
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

function readVisualInfo(nativeElement: NativeElement<HTMLElement>): VisualInfo {
    const {
        position,
        opacity,
        color,
        backgroundColor,
        borderRadius,
    } = nativeElement.getComputedStyle()
    const element = nativeElement.getInstance()

    return {
        style: {
            position,
            opacity: parseFloat(opacity),
            color,
            backgroundColor,
            borderRadius: parseFloat(borderRadius),
        },
        offset: offset.measure(element),
        boundingBox: boundingBox.measure(element),
    }
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

function getTransition({ layoutTransition, positionTransition }: AutoProps) {
    return layoutTransition || positionTransition
}

const subscriptionSymbol = Symbol("layout")

export class AutoAnimation extends React.Component<
    FunctionalProps & AutoProps
> {
    static contextType = SyncLayoutContext

    prev: VisualInfo

    constructor(props: FunctionalProps & AutoProps) {
        super(props)

        // Setup layout continuity
        if (props.layoutId === undefined) return

        props.nativeElement.onMount(subscriptionSymbol, () => {
            this.retrieveLayoutContinuity()
        })

        // TODO: This only works for actual unmounts, but won't work with AnimatePresence
        props.nativeElement.onUnmount(subscriptionSymbol, nativeElement => {
            this.saveLayoutContinuity(nativeElement)
        })
    }

    // Measure the current state of the DOM before it's updated, and schedule checks to see
    // if it's changed as a result of a React render.
    getSnapshotBeforeUpdate() {
        this.prev = readVisualInfo(this.props.nativeElement)
        this.prepareLayoutTransition()

        return null
    }

    prepareLayoutTransition() {
        const {
            nativeElement,
            positionTransition,
            values,
            controls,
            localContext,
            parentContext,
        } = this.props

        const element = nativeElement.getInstance()
        if (!isHTMLElement(element)) return

        const layoutTransition = getTransition(this.props) as boolean
        const isPositionOnly = !!positionTransition

        let transform: string | null
        let next: VisualInfo
        let compareLayout: LayoutType
        let layoutDelta: LayoutDelta

        sync(autoKey, (read, write) => {
            read(() => (transform = element.style.transform))

            write(() => (element.style.transform = ""))

            read(() => {
                //console.log("read", this.props.layoutId)
                // Read the target VisualInfo of all layoutTransition components
                next = readVisualInfo(nativeElement)
                compareLayout = getLayoutType(
                    this.prev.style.position,
                    next.style.position,
                    isPositionOnly
                )

                const prevLayout = compareLayout.getLayout(this.prev)
                const nextLayout = compareLayout.getLayout(next)
                layoutDelta = calcDelta(prevLayout, nextLayout)
                localContext.layoutDelta = layoutDelta
            })

            write(() => {
                syncRenderSession.open()

                /**
                 * ===============================================
                 * Auto layout transition
                 * ===============================================
                 * TODO: Refactor into its own function after figuring out context stuff
                 */
                // Reverse the layout delta of all newly laid-out auto components into their
                // prev visual state and then animate them into their new one using transforms.

                const parentLayoutDelta = parentContext.layoutDelta
                const parentValues = parentContext.values
                if (parentLayoutDelta && parentValues) {
                    const { values } = this.props

                    if (parentLayoutDelta.width) {
                        invertScale(values, parentValues, "scaleX")
                    }

                    if (parentLayoutDelta.height) {
                        invertScale(values, parentValues, "scaleY")
                    }
                }

                let shouldTransitionLayout = !!(
                    layoutDelta.x ||
                    layoutDelta.y ||
                    layoutDelta.width ||
                    layoutDelta.height
                )

                if (shouldTransitionLayout) {
                    const target: TargetAndTransition = {}
                    const transition: Transition = {}

                    if (parentLayoutDelta) {
                        layoutDelta = applyParentDelta(
                            layoutDelta,
                            parentLayoutDelta
                        )
                    }

                    nativeElement.setStyle({
                        originX: layoutDelta.originX,
                        originY: layoutDelta.originY,
                    })

                    const transitionDefinition = isResolver(layoutTransition)
                        ? layoutTransition({ delta: layoutDelta })
                        : layoutTransition

                    if (!transitionDefinition) shouldTransitionLayout = false

                    const makeTransition = (
                        layoutKey: keyof Layout,
                        transformKey: string,
                        targetValue: number,
                        visualOrigin: number
                    ) => {
                        // If this dimension hasn't changed, early return
                        const deltaKey = isSizeKey(layoutKey)
                            ? layoutKey
                            : transformKey
                        if (!layoutDelta[deltaKey]) return

                        const baseTransition =
                            typeof transitionDefinition === "boolean"
                                ? getDefaultLayoutTransition(isPositionOnly)
                                : transitionDefinition

                        const value = values.get(transformKey, targetValue)

                        transition[transformKey] = baseTransition[transformKey]
                            ? { ...baseTransition[transformKey] }
                            : { ...baseTransition }

                        // TODO: Double check this is correct behaviour
                        const velocity = value.getVelocity()
                        if (transition[transformKey].velocity === undefined) {
                            transition[transformKey].velocity = velocity || 0
                        }

                        // The target value of all transforms is the default value of that prop (ie x = 0, scaleX = 1)
                        // This is because we're inverting the layout change with `transform` and then animating to `transform: none`
                        // TODO We might need to check if there's a transform set for instance via style
                        target[transformKey] = targetValue

                        let offsetToApply =
                            !isSizeKey(layoutKey) && compareLayout === offset
                                ? value.get()
                                : 0

                        value.set(visualOrigin + offsetToApply)
                    }

                    makeTransition("left", "x", 0, layoutDelta.x)
                    makeTransition("top", "y", 0, layoutDelta.y)

                    // TODO Remove positionOnly stuff
                    if (!isPositionOnly) {
                        makeTransition("width", "scaleX", 1, layoutDelta.scaleX)
                        makeTransition(
                            "height",
                            "scaleY",
                            1,
                            layoutDelta.scaleY
                        )
                    }

                    target.transition = transition
                    shouldTransitionLayout && controls.start(target)
                } else if (transform) {
                    element.style.transform = transform
                }

                /**
                 * ===============================================
                 * Auto style transition
                 * ===============================================
                 * TODO: Refactor into its own function after figuring out context stuff
                 */
                let shouldTransitionStyle = false
                const styleTarget: TargetAndTransition = {}
                const styleTransition: Transition = {}

                for (const key in this.prev.style) {
                    const prevStyle = this.prev.style[key]
                    const nextStyle = next.style[key]

                    if (prevStyle !== nextStyle) {
                        shouldTransitionStyle = true
                        const value = values.get(key, prevStyle)
                        value.set(prevStyle)

                        // TODO: Take default transition
                        styleTransition[key] = {}
                        styleTarget[key] = nextStyle
                    }
                }

                styleTarget.transition = styleTransition
                shouldTransitionStyle && controls.start(styleTarget)

                syncRenderSession.flush()
            })
        })

        return null
    }

    hasLayoutContinuity(
        nativeElement: NativeElement = this.props.nativeElement
    ) {
        const { layoutId, layoutTransition } = this.props
        const element = nativeElement.getInstance()
        return (
            layoutId !== undefined && layoutTransition && isHTMLElement(element)
        )
    }

    saveLayoutContinuity(nativeElement: NativeElement) {
        const { layoutId } = this.props
        if (!this.hasLayoutContinuity(nativeElement)) return

        layoutContinuity.set(layoutId as string, readVisualInfo(nativeElement))
    }

    retrieveLayoutContinuity() {
        const { layoutId } = this.props

        if (!this.hasLayoutContinuity()) return

        const prev = layoutContinuity.get(layoutId as string)
        if (!prev) return

        this.prev = prev
        this.prepareLayoutTransition()

        // TODO: If we delete this after a layoutSync session we could use the same origin for multiple destinations
        layoutContinuity.delete(layoutId as string)
    }

    componentDidUpdate() {
        flush(autoKey)
    }

    componentDidMount() {
        flush(autoKey)
    }

    render() {
        return null
    }
}

function applyParentDelta(
    delta: LayoutDelta,
    parentDelta: LayoutDelta
): LayoutDelta {
    delta.x = delta.x - parentDelta.x
    delta.y = delta.y - parentDelta.y

    // TODO: Do we actually have to apply parent delta? I think this is just covered with scale
    // delta.width = delta.width - parentDelta.width
    // delta.height = delta.height - parentDelta.height

    return delta
}

function invertScale(
    values: MotionValuesMap,
    parentValues: MotionValuesMap,
    key: string
) {
    const parentScale = parentValues.get(key, 1)
    // const scale = values.get(key)

    // if (scale) {

    // }
    // parentScale.addChild()
    // const scale = motionValue(1, { transformer: invertScale })
    // parentScale.children?.add(scale)
    // values.set(key, scale)
}

export const Auto: FunctionalComponentDefinition = {
    key: autoKey,
    shouldRender: ({
        auto,
        positionTransition,
        layoutTransition,
    }: MotionProps) => {
        invariant(
            !(positionTransition && layoutTransition),
            `Don't set both positionTransition and layoutTransition on the same component`
        )

        // warning(
        //     !positionTransition && !layoutTransition,
        //     "positionTransition and layoutTransition are deprecated. Use the auto prop instead."
        // )

        return (
            typeof window !== "undefined" &&
            !!(positionTransition || layoutTransition || auto)
        )
    },
    Component: AutoAnimation,
}
