import { FeatureProps } from "../motion/features/types";
/**
 *
 * @param handlers -
 * @param ref -
 *
 * @internalremarks
 * Currently this sets new pan gesture functions every render. The memo route has been explored
 * in the past but ultimately we're still creating new functions every render. An optimisation
 * to explore is creating the pan gestures and loading them into a `ref`.
 *
 * @internal
 */
export declare function usePanGesture({ onPan, onPanStart, onPanEnd, onPanSessionStart, visualElement, }: FeatureProps): void;
