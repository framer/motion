import { PopmotionTransitionProps, ValueTarget, SingleTarget } from "../../types";
export declare const underDampedSpring: () => {
    type: string;
    stiffness: number;
    damping: number;
    restSpeed: number;
};
export declare const criticallyDampedSpring: (to: SingleTarget) => {
    type: string;
    stiffness: number;
    damping: number;
    restSpeed: number;
};
export declare const linearTween: () => {
    type: string;
    ease: string;
    duration: number;
};
export declare const getDefaultTransition: (valueKey: string, to: ValueTarget) => PopmotionTransitionProps;
