export { motionValue, MotionValue } from "./value"
export type { PassiveEffect, Subscriber } from "./value"
export { animate, createScopedAnimate } from "./animation/animate"
export { scroll } from "./render/dom/scroll"
export { scrollInfo } from "./render/dom/scroll/track"
export { inView } from "./render/dom/viewport"
export { animateStyle } from "./animation/animators/waapi/animate-dom"
export { animateSequence } from "./animation/animators/waapi/animate-sequence"

/**
 * Easing
 */
export * from "./easing/anticipate"
export * from "./easing/back"
export * from "./easing/circ"
export * from "./easing/ease"
export * from "./easing/cubic-bezier"
export * from "./easing/steps"
export * from "./easing/modifiers/mirror"
export * from "./easing/modifiers/reverse"

/**
 * Animation generators
 */
export { spring } from "./animation/generators/spring"
export { inertia } from "./animation/generators/inertia"
export { keyframes } from "./animation/generators/keyframes"

/**
 * Utils
 */
export { stagger } from "./animation/utils/stagger"
export { transform } from "./utils/transform"
export { clamp } from "./utils/clamp"
export * from "./utils/delay"
export * from "./utils/distance"
export * from "./utils/errors"
export * from "./utils/interpolate"
export { mix } from "./utils/mix"
export { pipe } from "./utils/pipe"
export { progress } from "./utils/progress"
export { wrap } from "./utils/wrap"
export * from "./frameloop"

/**
 * Deprecated
 */
export { sync, cancelSync } from "./frameloop/index-legacy"
