/**
 * Components
 */
export { motion, m } from "./render/dom"
export { AnimatePresence } from "./components/AnimatePresence"
export { AnimateSharedLayout } from "./components/AnimateSharedLayout"

/**
 * Features
 */
export { Animation as AnimationFeature } from "./motion/features/animation"
export { Drag as DragFeature } from "./motion/features/drag"
export { Exit as ExitFeature } from "./motion/features/exit"
export { Gestures as GesturesFeature } from "./motion/features/gestures"
export { AnimateLayout as AnimateLayoutFeature } from "./motion/features/layout/Animate"

/**
 * Motion values
 */
export { useMotionValue } from "./value/use-motion-value"
export { MotionValue, motionValue, PassiveEffect, Subscriber } from "./value"
export { resolveMotionValue } from "./value/utils/resolve-motion-value"
export { useInvertedScale } from "./value/use-inverted-scale"
export { useTransform } from "./value/use-transform"
export { useSpring } from "./value/use-spring"
export { ScrollMotionValues } from "./value/scroll/utils"
export { useElementScroll } from "./value/scroll/use-element-scroll"
export { useViewportScroll } from "./value/scroll/use-viewport-scroll"

/**
 * Utils
 */
export {
    AnimationControls,
    animationControls,
} from "./animation/AnimationControls"
export { useAnimation } from "./animation/use-animation"
export {
    HoverHandlers,
    TapHandlers,
    PanHandlers,
    TapInfo,
    PanInfo,
    useTapGesture,
    usePanGesture,
    useGestures,
} from "./gestures"
export { useCycle } from "./utils/use-cycle"
export { transform } from "./utils/transform"
export { useReducedMotion } from "./utils/use-reduced-motion"
export { ReducedMotion } from "./components/ReducedMotion"
export { isValidMotionProp } from "./motion/utils/valid-prop"
export {
    usePresence,
    useIsPresent,
} from "./components/AnimatePresence/use-presence"
export {
    useDragControls,
    DragControls,
} from "./gestures/drag/use-drag-controls"
export { useDomEvent } from "./events/use-dom-event"
export { useExternalRef } from "./motion/utils/use-external-ref"
export { createMotionComponent } from "./motion"
export { useAnimatedState } from "./animation/use-animated-state"
export { addScaleCorrection } from "./render/dom/layout/scale-correction"

/**
 * Contexts
 */
export {
    MotionConfig,
    MotionConfigContext,
} from "./motion/context/MotionConfigContext"
export { MotionContext } from "./motion/context/MotionContext"
export { PresenceContext } from "./components/AnimatePresence/PresenceContext"

/**
 * Types
 */
export {
    HTMLMotionProps,
    SVGMotionProps,
    SVGAttributesAsMotionValues,
    ForwardRefComponent,
} from "./render/dom/types"
export { CustomDomComponent } from "./render/dom"
export {
    AnimationProps,
    MotionProps,
    MotionCallbacks,
    MotionAdvancedProps,
    MotionStyle,
    MotionTransform,
    VariantLabels,
    RelayoutInfo,
    ResolveLayoutTransition,
} from "./motion/types"
export { VisualElementAnimationControls } from "./animation/VisualElementAnimationControls"
export {
    Orchestration,
    Tween,
    Spring,
    Keyframes,
    Inertia,
    None,
    EasingFunction,
    TargetAndTransition,
    Transition,
    ResolvedKeyframesTarget,
    KeyframesTarget,
    CustomValueType,
    ResolvedSingleTarget,
    SingleTarget,
    ResolvedValueTarget,
    ValueTarget,
    Variant,
    Variants,
} from "./types"
export { EventInfo } from "./events/types"
export { MotionFeature, FeatureProps } from "./motion/features/types"
export { GestureHandlers } from "./gestures"
export { DraggableProps, DragHandlers } from "./gestures/drag/types"
export { LayoutProps } from "./motion/features/layout/types"
export { AnimatePresenceProps } from "./components/AnimatePresence/types"
export { SharedLayoutProps } from "./components/AnimateSharedLayout/types"
export * from "./types/geometry"
