import { VariantLabels } from "../../motion/types";
import { TargetAndTransition } from "../../types";
import { VisualElement } from "../types";
import { AnimationOptions } from "./animation";
import { AnimationType } from "./types";
export interface AnimationState {
    animateChanges: (options?: AnimationOptions, type?: AnimationType) => Promise<any>;
    setActive: (type: AnimationType, isActive: boolean, options?: AnimationOptions) => Promise<any>;
    setAnimateFunction: (fn: any) => void;
    isAnimated(key: string): boolean;
    getState: () => {
        [key: string]: AnimationTypeState;
    };
}
export declare type AnimationList = string[] | TargetAndTransition[];
export declare const variantPriorityOrder: AnimationType[];
export declare function createAnimationState(visualElement: VisualElement): AnimationState;
export declare function checkVariantsDidChange(prev: any, next: any): boolean;
export interface AnimationTypeState {
    isActive: boolean;
    protectedKeys: {
        [key: string]: true;
    };
    needsAnimating: {
        [key: string]: boolean;
    };
    prevResolvedValues: {
        [key: string]: any;
    };
    prevProp?: VariantLabels | TargetAndTransition;
}
