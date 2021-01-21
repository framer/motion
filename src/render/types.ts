import { Ref } from "react"
import { LayoutUpdateHandler } from "."
import {
    Presence,
    SharedLayoutAnimationConfig,
} from "../components/AnimateSharedLayout/types"
import { Snapshot } from "../components/AnimateSharedLayout/utils/stack"
import { OnViewportBoxUpdate } from "../motion/features/layout/types"
import { MotionProps } from "../motion/types"
import { TargetAndTransition, Transition, Variant } from "../types"
import { AxisBox2D, BoxDelta, Point2D } from "../types/geometry"
import { MotionValue } from "../value"
import { AnimationState } from "./utils/animation-state"

export interface MotionPoint {
    x: MotionValue<number>
    y: MotionValue<number>
}

export interface VisualElement<Instance = any, MutableState = any> {
    depth: number
    current: Instance | null
    manuallyAnimateOnMount: boolean
    variantChildren?: Set<VisualElement>
    isMounted: boolean
    subscribeToVariantParent(): void
    getVariantParent(): undefined | VisualElement
    getInstance(): Instance | null
    path: VisualElement[]
    addChild(child: VisualElement): () => void
    ref: Ref<Instance | null>

    /**
     * Visibility
     */
    isVisible: boolean
    show(): void
    hide(): void

    hasValue(key: string): boolean
    addValue(key: string, value: MotionValue<any>): void
    removeValue(key: string): void
    getValue(key: string): undefined | MotionValue
    getValue(key: string, defaultValue: string | number): MotionValue
    getValue(
        key: string,
        defaultValue?: string | number
    ): undefined | MotionValue
    forEachValue(callback: (value: MotionValue, key: string) => void): void
    readValue(key: string): string | number | undefined | null
    setBaseTarget(key: string, value: string | number | null): void
    getBaseTarget(key: string): number | string | undefined | null
    getStaticValue(key: string): number | string | undefined
    setStaticValue(key: string, value: number | string): void
    getLatestValues(): ResolvedValues
    scheduleRender(): void
    updateProps(props: MotionProps): void
    getVariant(name: string): Variant | undefined
    getVariantData(): any
    getDefaultTransition(): Transition | undefined
    getVariantContext(
        startAtParent?: boolean
    ):
        | undefined
        | {
              initial?: string | string[]
              animate?: string | string[]
              exit?: string | string[]
              whileHover?: string | string[]
              whileDrag?: string | string[]
              whileFocus?: string | string[]
              whileTap?: string | string[]
          }
    notifyAnimationStart(): void
    notifyAnimationComplete(): void

    build(): MutableState
    syncRender(): void

    /**
     * Layout projection - perhaps a candidate for lazy-loading
     * or an external interface. Move into Projection?
     */
    isHoverEventsEnabled: boolean
    suspendHoverEvents(): void
    withoutTransform(callback: () => void): void
    enableLayoutProjection(): void
    lockProjectionTarget(): void
    unlockProjectionTarget(): void
    rebaseProjectionTarget(force?: boolean, sourceBox?: AxisBox2D): void
    measureViewportBox(withTransform?: boolean): AxisBox2D
    updateLayoutMeasurement(): void
    getMeasuredLayout(): AxisBox2D
    getProjection(): Projection
    getProjectionTarget(): AxisBox2D
    getProjectionAnimationProgress(): MotionPoint
    setProjectionTargetAxis(axis: "x" | "y", min: number, max: number): void
    startLayoutAnimation(axis: "x" | "y", transition: Transition): Promise<any>
    stopLayoutAnimation(): void
    snapshotViewportBox(): void
    updateLayoutProjection(): void
    makeTargetAnimatable(
        target: TargetAndTransition,
        isLive?: boolean
    ): TargetAndTransition
    scheduleUpdateLayoutProjection(): void
    // TODO: notifyLayoutMeasurementsUpdated ?
    notifyLayoutReady(config?: SharedLayoutAnimationConfig): void
    resetTransform(): void

    onLayoutUpdate(callback: LayoutUpdateHandler): () => void
    onLayoutMeasure(callback: LayoutUpdateHandler): () => void
    onViewportBoxUpdate(callback: OnViewportBoxUpdate): () => void

    // TODO save this somewhere else
    isPresent: boolean
    presence: Presence
    isPresenceRoot?: boolean
    prevSnapshot?: Snapshot
    prevViewportBox?: AxisBox2D
    layoutId?: string

    animationState?: AnimationState
}

export interface VisualElementConfig<Instance, MutableState, Options> {
    initMutableState(): MutableState
    onMount?: (
        element: VisualElement<Instance>,
        instance: Instance,
        mutableState: MutableState
    ) => void
    getBaseTarget?(
        props: MotionProps,
        key: string
    ): string | number | undefined | MotionValue
    build(
        latest: ResolvedValues,
        mutableState: MutableState,
        projection: Projection,
        options: Options,
        props: MotionProps
    ): void
    makeTargetAnimatable(
        element: VisualElement<Instance>,
        target: TargetAndTransition,
        props: MotionProps,
        isLive: boolean
    ): TargetAndTransition
    measureViewportBox(instance: Instance, options: Options): AxisBox2D
    readNativeValue(
        instance: Instance,
        key: string,
        options: Options
    ): string | number | null | undefined
    resetTransform(
        element: VisualElement<Instance>,
        instance: Instance,
        props: MotionProps
    ): void
    restoreTransform(instance: Instance, mutableState: MutableState): void
    render(instance: Instance, mutableState: MutableState): void
    removeValueFromMutableState(key: string, mutableState: MutableState): void
    scrapeMotionValuesFromProps(
        props: MotionProps
    ): { [key: string]: MotionValue | string | number }
}

export type VisualElementOptions<Instance> = {
    ref?: Ref<Instance>
    parent?: VisualElement<unknown>
    isStatic?: boolean
    props: MotionProps
    blockInitialAnimation?: boolean
}

export interface Projection {
    isEnabled: boolean

    isTargetLocked: boolean

    /**
     * The measured bounding box as it exists on the page with no transforms applied.
     *
     * To calculate the visual output of a component in any given frame, we:
     *
     *   1. box -> boxCorrected
     *      Apply the delta between the tree transform when the box was measured and
     *      the tree transform in this frame to the box
     *   2. targetBox -> targetBoxFinal
     *      Apply the VisualElement's `transform` properties to the targetBox
     *   3. Calculate the delta between boxCorrected and targetBoxFinal and apply
     *      it as a transform style.
     */
    layout: AxisBox2D

    /**
     * The `box` layout with transforms applied from up the
     * tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    layoutCorrected: AxisBox2D

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    target: AxisBox2D

    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    targetFinal: AxisBox2D

    /**
     * The overall scale of the local coordinate system as transformed by all parents
     * of this component. We use this for scale correction on our calculated layouts
     * and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    treeScale: Point2D

    /**
     * The delta between the boxCorrected and the desired
     * targetBox (before user-set transforms are applied). The calculated output will be
     * handed to the renderer and used as part of the style correction calculations, for
     * instance calculating how to display the desired border-radius correctly.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    delta: BoxDelta

    /**
     * The delta between the boxCorrected and the desired targetBoxFinal. The calculated
     * output will be handed to the renderer and used to project the boxCorrected into
     * the targetBoxFinal.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    deltaFinal: BoxDelta
}

export type ExtendVisualElement<
    Extended extends VisualElement,
    Element = any
> = (element: VisualElement<Element>) => Extended

export type UseVisualElement<E, P = MotionProps> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps & P,
    isStatic?: boolean,
    ref?: Ref<E>
) => VisualElement

/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number
}
