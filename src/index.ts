/**
 * Components
 */
export { motion, createDomMotionComponent } from "./render/dom/motion"
export { m } from "./render/dom/motion-minimal"
export { AnimatePresence } from "./components/AnimatePresence"
export { AnimateSharedLayout } from "./components/AnimateSharedLayout"
export { MotionConfig } from "./components/MotionConfig"
export { LazyMotion } from "./components/LazyMotion"

/**
 * Features
 */
export { domAnimation } from "./render/dom/features-animation"
export { domMax } from "./render/dom/features-max"

/**
 * Motion values
 */
export { useMotionValue } from "./value/use-motion-value"
export { useMotionTemplate } from "./value/use-motion-template"
export { MotionValue, motionValue, PassiveEffect, Subscriber } from "./value"
export { resolveMotionValue } from "./value/utils/resolve-motion-value"
export { useTransform } from "./value/use-transform"
export { useSpring } from "./value/use-spring"
export { useVelocity } from "./value/use-velocity"
export { useElementScroll } from "./value/scroll/use-element-scroll"
export { useViewportScroll } from "./value/scroll/use-viewport-scroll"

/**
 * Accessibility
 */
export { useReducedMotion } from "./utils/use-reduced-motion"

/**
 * Utils
 */
export { animationControls } from "./animation/animation-controls"
export { AnimationControls } from "./animation/types"
export { useAnimation } from "./animation/use-animation"
export { animate } from "./animation/animate"
export { animateVisualElement } from "./render/utils/animation"
export {
    HoverHandlers,
    TapHandlers,
    PanHandlers,
    FocusHandlers,
    TapInfo,
} from "./gestures/types"
export { PanInfo } from "./gestures/PanSession"
export { useCycle } from "./utils/use-cycle"
export { transform } from "./utils/transform"
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
export { createMotionComponent } from "./motion"
export { addScaleCorrection } from "./render/dom/projection/scale-correction"
export { createCrossfader } from "./components/AnimateSharedLayout/utils/crossfader"

export { visualElement } from "./render"
export { VisualElement } from "./render/types"

/**
 * Contexts
 */
export { MotionConfigContext } from "./context/MotionConfigContext"
export { PresenceContext } from "./context/PresenceContext"
export { LayoutGroupContext } from "./context/LayoutGroupContext"

/**
 * Types
 */
export { HTMLMotionProps, ForwardRefComponent } from "./render/html/types"
export { SVGMotionProps, SVGAttributesAsMotionValues } from "./render/svg/types"
export {
    AnimationOptions,
    AnimationPlaybackControls,
} from "./animation/animate"
export { CustomDomComponent } from "./render/dom/motion-proxy"
export { ScrollMotionValues } from "./value/scroll/utils"
export {
    AnimationProps,
    MotionProps,
    MotionAdvancedProps,
    MotionStyle,
    MotionTransform,
    VariantLabels,
    RelayoutInfo,
    ResolveLayoutTransition,
} from "./motion/types"
export {
    Orchestration,
    Repeat,
    Tween,
    Spring,
    Keyframes,
    Inertia,
    None,
    EasingFunction,
    Target,
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
export { VisualElementLifecycles } from "./render/utils/lifecycles"
export * from "./motion/features/types"
export {
    DraggableProps,
    DragHandlers,
    DragElastic,
} from "./gestures/drag/types"
export { LayoutProps } from "./motion/features/layout/types"
export { AnimatePresenceProps } from "./components/AnimatePresence/types"
export { SharedLayoutProps } from "./components/AnimateSharedLayout/types"
export {
    SharedLayoutAnimationConfig,
    VisibilityAction,
    SharedLayoutSyncMethods,
    SyncLayoutLifecycles,
} from "./components/AnimateSharedLayout/types"
export {
    SharedLayoutContext,
    FramerTreeLayoutContext,
} from "./context/SharedLayoutContext"
export { createBatcher } from "./components/AnimateSharedLayout/utils/batcher"
export * from "./types/geometry"
export { MotionConfigProps } from "./components/MotionConfig"
export { LazyProps } from "./components/LazyMotion/types"
export { FlatTree } from "./render/utils/flat-tree"

/**
 * Deprecated
 */
export { useAnimatedState as useDeprecatedAnimatedState } from "./animation/use-animated-state"
export { useInvertedScale as useDeprecatedInvertedScale } from "./value/use-inverted-scale"
