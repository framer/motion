import { RefObject } from "react";
import { TargetAndTransition } from "../../../types";
import { VariantLabels } from "../../types";
export declare type ViewportEventHandler = (entry: IntersectionObserverEntry | null) => void;
export interface ViewportOptions {
    root?: RefObject<Element>;
    once?: boolean;
    margin?: string;
    amount?: "some" | "all" | number;
}
export interface ViewportProps {
    whileInView?: VariantLabels | TargetAndTransition;
    onViewportEnter?: ViewportEventHandler;
    onViewportLeave?: ViewportEventHandler;
    viewport?: ViewportOptions;
}
export declare type ViewportState = {
    hasEnteredView: boolean;
    isInView: boolean;
};
