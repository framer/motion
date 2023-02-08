import { MotionProps } from "../motion/types"
import { VisualState } from "../motion/utils/use-visual-state"
import { MotionValue } from "../value"
import { ReducedMotionConfig } from "../context/MotionConfigContext"
import { AnimationDefinition } from "./utils/animation"
import { Axis, Box } from "../projection/geometry/types"
import type { MotionNodeProps, VisualElement } from "./VisualElement"

export interface MotionPoint {
    x: MotionValue<number>
    y: MotionValue<number>
}

export type VariantStateContext = {
    initial?: string | string[]
    animate?: string | string[]
    exit?: string | string[]
    whileHover?: string | string[]
    whileDrag?: string | string[]
    whileFocus?: string | string[]
    whileTap?: string | string[]
}

export type ScrapeMotionValuesFromProps = (
    props: MotionProps,
    prevProps: MotionProps
) => {
    [key: string]: MotionValue | string | number
}

export type UseRenderState<RenderState = any> = () => RenderState

export type VisualElementOptions<Instance, RenderState = any> = {
    visualState: VisualState<Instance, RenderState>
    parent?: VisualElement<unknown>
    variantParent?: VisualElement<unknown>
    presenceId?: string | undefined
    props: MotionNodeProps
    blockInitialAnimation?: boolean
    reducedMotionConfig?: ReducedMotionConfig
}

/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number
}

export interface VisualElementEventCallbacks {
    BeforeLayoutMeasure: () => void
    LayoutMeasure: (layout: Box, prevLayout?: Box) => void
    LayoutUpdate: (layout: Axis, prevLayout: Axis) => void
    Update: (latest: ResolvedValues) => void
    AnimationStart: (definition: AnimationDefinition) => void
    AnimationComplete: (definition: AnimationDefinition) => void
    LayoutAnimationStart: () => void
    LayoutAnimationComplete: () => void
    SetAxisTarget: () => void
    Unmount: () => void
    InsertionEffect: () => void
    LayoutEffect: () => void
    Effect: () => void
}

export interface LayoutLifecycles {
    onBeforeLayoutMeasure?(box: Box): void

    onLayoutMeasure?(box: Box, prevBox: Box): void

    /**
     * @internal
     */
    onLayoutAnimationStart?(): void

    /**
     * @internal
     */
    onLayoutAnimationComplete?(): void
}

export interface AnimationLifecycles {
    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: ResolvedValues): void

    /**
     * Callback when animation defined in `animate` begins.
     *
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has started.
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(definition: AnimationDefinition): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has completed.
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div
     *   animate={{ x: 100 }}
     *   onAnimationComplete={definition => {
     *     console.log('Completed animating', definition)
     *   }}
     * />
     * ```
     */
    onAnimationComplete?(definition: AnimationDefinition): void
}

export type EventProps = LayoutLifecycles & AnimationLifecycles

export type CreateVisualElement<Instance> = (
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>,
    options: VisualElementOptions<Instance>
) => VisualElement<Instance>
