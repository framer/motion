/**
 * Components
 */
export { motion, createDomMotionComponent } from "./render/dom/motion";
export { m } from "./render/dom/motion-minimal";
export { AnimatePresence } from "./components/AnimatePresence";
export { AnimateSharedLayout } from "./components/AnimateSharedLayout";
export { MotionConfig } from "./components/MotionConfig";
export { LazyMotion } from "./components/LazyMotion";
export { LayoutGroup } from "./components/LayoutGroup";
export { Reorder } from "./components/Reorder";
/**
 * Three
 */
export * from "./three-entry";
/**
 * Features
 */
export { domAnimation } from "./render/dom/features-animation";
export { domMax } from "./render/dom/features-max";
/**
 * Motion values
 */
export { useMotionValue } from "./value/use-motion-value";
export { useMotionTemplate } from "./value/use-motion-template";
export { MotionValue, motionValue } from "./value";
export { resolveMotionValue } from "./value/utils/resolve-motion-value";
export { useTransform } from "./value/use-transform";
export { useSpring } from "./value/use-spring";
export { useVelocity } from "./value/use-velocity";
export { useElementScroll } from "./value/scroll/use-element-scroll";
export { useViewportScroll } from "./value/scroll/use-viewport-scroll";
export { useTime } from "./value/use-time";
/**
 * Accessibility
 */
export { useReducedMotion } from "./utils/use-reduced-motion";
/**
 * Utils
 */
export { animationControls } from "./animation/animation-controls";
export { useAnimation } from "./animation/use-animation";
export { useAnimationFrame } from "./utils/use-animation-frame";
export { animate } from "./animation/animate";
export { animateVisualElement } from "./render/utils/animation";
export { useCycle } from "./utils/use-cycle";
export { transform } from "./utils/transform";
export { isValidMotionProp } from "./motion/utils/valid-prop";
export { usePresence, useIsPresent, } from "./components/AnimatePresence/use-presence";
export { useDragControls, DragControls, } from "./gestures/drag/use-drag-controls";
export { useDomEvent } from "./events/use-dom-event";
export { createMotionComponent } from "./motion";
export { visualElement } from "./render";
export { addScaleCorrector } from "./projection/styles/scale-correction";
export { useInstantTransition } from "./utils/use-instant-transition";
export { useInstantLayoutTransition } from "./projection/use-instant-layout-transition";
export { useResetProjection } from "./projection/use-reset-projection";
/**
 * Contexts
 */
export { MotionContext } from "./context/MotionContext";
export { MotionConfigContext } from "./context/MotionConfigContext";
export { PresenceContext } from "./context/PresenceContext";
export { LayoutGroupContext } from "./context/LayoutGroupContext";
export { DeprecatedLayoutGroupContext } from "./context/DeprecatedLayoutGroupContext";
export { SwitchLayoutGroupContext } from "./context/SwitchLayoutGroupContext";
export * from "./motion/features/types";
export { FlatTree } from "./render/utils/flat-tree";
export * from "./projection/geometry/types";
/**
 * Deprecated
 */
export { useAnimatedState as useDeprecatedAnimatedState } from "./animation/use-animated-state";
export { useInvertedScale as useDeprecatedInvertedScale } from "./value/use-inverted-scale";
//# sourceMappingURL=index.js.map