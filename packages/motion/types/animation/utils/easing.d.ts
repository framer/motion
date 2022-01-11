import { Easing } from "../../types";
export declare const easingDefinitionToFunction: (definition: Easing) => import("../../types").EasingFunction;
export declare const isEasingArray: (ease: any) => ease is Easing[];
