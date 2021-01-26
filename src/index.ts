/**
 * Components
 */
export { motion, createDomMotionComponent } from "./render/dom/motion"
export { m } from "./render/dom/motion-minimal"
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
export { useMotionTemplate } from "./value/use-motion-template"
export { MotionValue, motionValue, PassiveEffect, Subscriber } from "./value"
export { resolveMotionValue } from "./value/utils/resolve-motion-value"
export { useTransform } from "./value/use-transform"
export { useSpring } from "./value/use-spring"
export { useElementScroll } from "./value/scroll/use-element-scroll"
export { useViewportScroll } from "./value/scroll/use-viewport-scroll"

/**
 * Accessibility
 */
export { useReducedMotion } from "./utils/use-reduced-motion"

/**
 * Utils
 */
export {
    AnimationControls,
    animationControls,
} from "./animation/AnimationControls"
export { useAnimation } from "./animation/use-animation"
export { animate } from "./animation/animate"
export { animateVisualElement } from "./render/utils/animation"
export {
    HoverHandlers,
    TapHandlers,
    PanHandlers,
    FocusHandlers,
    TapInfo,
    PanInfo,
    GestureHandlers,
    useTapGesture,
    usePanGesture,
    useGestures,
} from "./gestures"
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
export { useExternalRef } from "./motion/utils/use-external-ref"
export { createMotionComponent } from "./motion"
export { addScaleCorrection } from "./render/dom/projection/scale-correction"
export { createCrossfadeState } from "./components/AnimateSharedLayout/utils/stack"

export { visualElement } from "./render"
export { VisualElement } from "./render/types"

/**
 * Contexts
 */
export {
    MotionConfig,
    MotionConfigContext,
} from "./motion/context/MotionConfigContext"
export { PresenceContext } from "./components/AnimatePresence/PresenceContext"
export { LayoutGroupContext } from "./components/AnimateSharedLayout/LayoutGroupContext"

/**
 * Types
 */
export {
    HTMLMotionProps,
    SVGMotionProps,
    SVGAttributesAsMotionValues,
    ForwardRefComponent,
} from "./render/dom/types"
export { CustomDomComponent } from "./render/dom/motion"
export { ScrollMotionValues } from "./value/scroll/utils"
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
export { MotionFeature, FeatureProps } from "./motion/features/types"
export { DraggableProps, DragHandlers } from "./gestures/drag/types"
export { LayoutProps } from "./motion/features/layout/types"
export { AnimatePresenceProps } from "./components/AnimatePresence/types"
export { SharedLayoutProps } from "./components/AnimateSharedLayout/types"
export {
    SharedLayoutAnimationConfig,
    VisibilityAction,
} from "./components/AnimateSharedLayout/types"
export {
    SharedLayoutSyncMethods,
    SharedLayoutContext,
    FramerTreeLayoutContext,
    SyncLayoutLifecycles,
    createBatcher,
} from "./components/AnimateSharedLayout/SharedLayoutContext"
export * from "./types/geometry"

/**
 * Deprecated
 */
export { useAnimatedState as useDeprecatedAnimatedState } from "./animation/use-animated-state"
export { useInvertedScale as useDeprecatedInvertedScale } from "./value/use-inverted-scale"
