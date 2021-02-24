import { Ref } from "react"
import { startAnimation } from "../animation/utils/transitions"
import {
    Presence,
    SharedLayoutAnimationConfig,
} from "../components/AnimateSharedLayout/types"
import { Crossfader } from "../components/AnimateSharedLayout/utils/crossfader"
import { MotionProps } from "../motion/types"
import { TargetAndTransition, Transition, Variant } from "../types"
import { AxisBox2D, Point2D } from "../types/geometry"
import { MotionValue } from "../value"
import { AnimationState } from "./utils/animation-state"
import { LifecycleManager } from "./utils/lifecycles"
import { LayoutState, TargetProjection } from "./utils/state"

export interface MotionPoint {
    x: MotionValue<number>
    y: MotionValue<number>
}

export interface VisualElement<Instance = any, MutableState = any>
    extends LifecycleManager {
    treeType: string
    depth: number
    current: Instance | null
    manuallyAnimateOnMount: boolean
    blockInitialAnimation?: boolean
    presenceId: number | undefined
    projection: TargetProjection
    variantChildren?: Set<VisualElement>
    isMounted(): boolean
    isStatic?: boolean
    clearState(props: MotionProps): void
    getInstance(): Instance | null
    path: VisualElement[]
    addChild(child: VisualElement): () => void
    ref: Ref<Instance | null>
    sortNodePosition(element: VisualElement): number

    addVariantChild(child: VisualElement): undefined | (() => void)
    getClosestVariantNode(): VisualElement | undefined

    setCrossfader(crossfader: Crossfader): void
    layoutSafeToRemove?: () => void

    animateMotionValue?: typeof startAnimation

    /**
     * Visibility
     */
    isVisible?: boolean
    setVisibility(visibility: boolean): void

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

    setProps(props: MotionProps): void
    getProps(): MotionProps
    getVariant(name: string): Variant | undefined
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
    getLayoutState: () => LayoutState
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
    notifyLayoutReady(config?: SharedLayoutAnimationConfig): void
    pointTo(element: VisualElement): void
    resetTransform(): void

    isPresent: boolean
    presence: Presence
    isPresenceRoot?: boolean
    prevDragCursor?: Point2D
    prevViewportBox?: AxisBox2D
    getLayoutId(): string | undefined
    animationState?: AnimationState
}

export interface VisualElementConfig<Instance, MutableState, Options> {
    treeType?: string
    createRenderState(): MutableState
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
        visualElement: VisualElement<Instance>,
        renderState: MutableState,
        latestValues: ResolvedValues,
        projection: TargetProjection,
        layoutState: LayoutState,
        options: Options,
        props: MotionProps
    ): void
    sortNodePosition?: (a: Instance, b: Instance) => number
    makeTargetAnimatable(
        element: VisualElement<Instance>,
        target: TargetAndTransition,
        props: MotionProps,
        isLive: boolean
    ): TargetAndTransition
    measureViewportBox(instance: Instance, options: Options): AxisBox2D
    readValueFromInstance(
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
    variantParent?: VisualElement<unknown>
    snapshot?: ResolvedValues
    isStatic?: boolean
    presenceId?: number | undefined
    props: MotionProps
    blockInitialAnimation?: boolean
}

export type ExtendVisualElement<
    Extended extends VisualElement,
    Element = any
> = (element: VisualElement<Element>) => Extended

export type CreateVisualElement<E> = (
    isStatic: boolean,
    options: VisualElementOptions<E>
) => VisualElement<E>

/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number
}
