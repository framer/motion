import { VariantLabels } from "../../motion/types";
import { Target, TargetAndTransition, TargetResolver, TargetWithKeyframes, Transition } from "../../types";
import { VisualElement } from "../types";
import { AnimationType } from "./types";
export declare type AnimationDefinition = VariantLabels | TargetAndTransition | TargetResolver;
export declare type AnimationOptions = {
    delay?: number;
    transitionOverride?: Transition;
    custom?: any;
    type?: AnimationType;
};
export declare type MakeTargetAnimatable = (visualElement: VisualElement, target: TargetWithKeyframes, origin?: Target, transitionEnd?: Target) => {
    target: TargetWithKeyframes;
    transitionEnd?: Target;
};
/**
 * @internal
 */
export declare function animateVisualElement(visualElement: VisualElement, definition: AnimationDefinition, options?: AnimationOptions): Promise<void>;
export declare function stopAnimation(visualElement: VisualElement): void;
export declare function sortByTreeOrder(a: VisualElement, b: VisualElement): number;
