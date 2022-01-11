import { Transition, PermissiveTransitionDefinition, ResolvedValueTarget } from "../../types";
import { AnimationOptions } from "popmotion";
import { MotionValue } from "../../value";
/**
 * Decide whether a transition is defined on a given Transition.
 * This filters out orchestration options and returns true
 * if any options are left.
 */
export declare function isTransitionDefined({ when, delay, delayChildren, staggerChildren, staggerDirection, repeat, repeatType, repeatDelay, from, ...transition }: Transition): boolean;
/**
 * Convert Framer Motion's Transition type into Popmotion-compatible options.
 */
export declare function convertTransitionToAnimationOptions<T>({ ease, times, yoyo, flip, loop, ...transition }: PermissiveTransitionDefinition): AnimationOptions<T>;
/**
 * Get the delay for a value by checking Transition with decreasing specificity.
 */
export declare function getDelayFromTransition(transition: Transition, key: string): any;
export declare function hydrateKeyframes(options: PermissiveTransitionDefinition): PermissiveTransitionDefinition;
export declare function getPopmotionAnimationOptions(transition: PermissiveTransitionDefinition, options: any, key: string): any;
export declare function isZero(value: string | number): boolean;
export declare function getZeroUnit(potentialUnitType: string | number): string | number;
export declare function getValueTransition(transition: Transition, key: string): any;
/**
 * Start animation on a MotionValue. This function is an interface between
 * Framer Motion and Popmotion
 *
 * @internal
 */
export declare function startAnimation(key: string, value: MotionValue, target: ResolvedValueTarget, transition?: Transition): Promise<void>;
