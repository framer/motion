import { MotionProps } from "../../motion/types";
import { TargetAndTransition, TargetResolver } from "../../types";
import { ResolvedValues, VisualElement } from "../types";
/**
 * Decides if the supplied variable is an array of variant labels
 */
export declare function isVariantLabels(v: unknown): v is string[];
/**
 * Decides if the supplied variable is variant label
 */
export declare function isVariantLabel(v: unknown): v is string | string[];
export declare function resolveVariantFromProps(props: MotionProps, definition: TargetAndTransition | TargetResolver, custom?: any, currentValues?: ResolvedValues, currentVelocity?: ResolvedValues): TargetAndTransition;
export declare function resolveVariantFromProps(props: MotionProps, definition?: string | TargetAndTransition | TargetResolver, custom?: any, currentValues?: ResolvedValues, currentVelocity?: ResolvedValues): undefined | TargetAndTransition;
/**
 * Resovles a variant if it's a variant resolver
 */
export declare function resolveVariant(visualElement: VisualElement, definition: TargetAndTransition | TargetResolver, custom?: any): TargetAndTransition;
export declare function resolveVariant(visualElement: VisualElement, definition?: string | TargetAndTransition | TargetResolver, custom?: any): TargetAndTransition | undefined;
export declare function checkIfControllingVariants(props: MotionProps): boolean;
export declare function checkIfVariantNode(props: MotionProps): boolean;
