"use client"

/**
 * Components
 */
export { motion, createDomMotionComponent } from "./render/dom/motion"
export { m } from "./render/dom/motion-minimal"
export { AnimatePresence } from "./components/AnimatePresence"
export { MotionConfig } from "./components/MotionConfig"
export { LazyMotion } from "./components/LazyMotion"
export { LayoutGroup } from "./components/LayoutGroup"
export { Reorder } from "./components/Reorder"

/**
 * Three
 */
export * from "./three-entry"

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
export { useScroll } from "./value/use-scroll"
export { useElementScroll } from "./value/scroll/use-element-scroll"
export { useViewportScroll } from "./value/scroll/use-viewport-scroll"
export { useTime } from "./value/use-time"
export { useWillChange } from "./value/use-will-change"
export { useMotionValueEvent } from "./utils/use-motion-value-event"

/**
 * Accessibility
 */
export { useReducedMotion } from "./utils/reduced-motion/use-reduced-motion"
export { useReducedMotionConfig } from "./utils/reduced-motion/use-reduced-motion-config"

/**
 * Utils
 */
export { animationControls } from "./animation/hooks/animation-controls"
export {
    useAnimation,
    useAnimationControls,
} from "./animation/hooks/use-animation"
export { useAnimationFrame } from "./utils/use-animation-frame"
export { animate } from "./animation/animate"
export { scroll } from "./render/dom/scroll"
export { animateVisualElement } from "./render/utils/animation"
export {
    HoverHandlers,
    TapHandlers,
    PanHandlers,
    FocusHandlers,
    TapInfo,
} from "./gestures/types"
export { PanInfo } from "./gestures/pan/PanSession"
export { useCycle, CycleState, Cycle } from "./utils/use-cycle"
export { transform } from "./utils/transform"
export { isValidMotionProp } from "./motion/utils/valid-prop"
export {
    usePresence,
    useIsPresent,
} from "./components/AnimatePresence/use-presence"
export { useInView } from "./utils/use-in-view"
export {
    useDragControls,
    DragControls,
} from "./gestures/drag/use-drag-controls"
export { useDomEvent } from "./events/use-dom-event"
export { createMotionComponent } from "./motion"
export { isMotionComponent } from "./motion/utils/is-motion-component"
export { unwrapMotionComponent } from "./motion/utils/unwrap-motion-component"
export { VisualElement } from "./render/VisualElement"
export { addScaleCorrector } from "./projection/styles/scale-correction"
export { useInstantTransition } from "./utils/use-instant-transition"
export { useInstantLayoutTransition } from "./projection/use-instant-layout-transition"
export { useResetProjection } from "./projection/use-reset-projection"
export { buildTransform } from "./render/html/utils/build-transform"
export { clamp } from "./utils/clamp"
export * from "./utils/delay"
export * from "./utils/distance"
export * from "./utils/errors"
export * from "./utils/interpolate"
export { mix } from "./utils/mix"
export { pipe } from "./utils/pipe"
export { progress } from "./utils/progress"
export { wrap } from "./utils/wrap"
export { sync } from "./frameloop"
export { frameData } from "./frameloop/data"
export { animateValue } from "./animation/legacy-popmotion"
export { inertia } from "./animation/legacy-popmotion/inertia"
export { color } from "./value/types/color"
export { complex } from "./value/types/complex"
export { px } from "./value/types/numbers/units"
export { ValueType } from "./value/types/types"

/**
 * Appear animations
 */
export { startOptimizedAppearAnimation } from "./animation/optimized-appear/start"
export { optimizedAppearDataAttribute } from "./animation/optimized-appear/data-id"
export { spring } from "./animation/legacy-popmotion/spring"

/**
 * Contexts
 */
export { MotionContext } from "./context/MotionContext"
export { MotionConfigContext } from "./context/MotionConfigContext"
export { PresenceContext } from "./context/PresenceContext"
export { LayoutGroupContext } from "./context/LayoutGroupContext"
export { SwitchLayoutGroupContext } from "./context/SwitchLayoutGroupContext"

/**
 * Easing functions
 */
export * from "./easing/anticipate"
export * from "./easing/back"
export * from "./easing/circ"
export * from "./easing/ease"
export * from "./easing/cubic-bezier"

/**
 * Types
 */
export { HTMLMotionProps, ForwardRefComponent } from "./render/html/types"
export { SVGMotionProps, SVGAttributesAsMotionValues } from "./render/svg/types"
export { AnimationLifecycles } from "./render/types"
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
export * from "./easing/types"
export { EventInfo } from "./events/types"
export * from "./motion/features/types"
export {
    DraggableProps,
    DragHandlers,
    DragElastic,
} from "./gestures/drag/types"
export { LayoutProps } from "./motion/features/layout/types"
export { AnimatePresenceProps } from "./components/AnimatePresence/types"
export { MotionConfigProps } from "./components/MotionConfig"
export { LazyProps } from "./components/LazyMotion/types"
export { FlatTree } from "./render/utils/flat-tree"
export { CreateVisualElement } from "./render/types"
export * from "./projection/geometry/types"
export { IProjectionNode } from "./projection/node/types"
export * from "./animation/types"

/**
 * Deprecated
 */
export { useAnimatedState as useDeprecatedAnimatedState } from "./animation/hooks/use-animated-state"
export { useInvertedScale as useDeprecatedInvertedScale } from "./value/use-inverted-scale"
export { AnimateSharedLayout } from "./components/AnimateSharedLayout"
