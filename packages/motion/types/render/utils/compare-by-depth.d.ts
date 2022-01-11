import { VisualElement } from "../types";
export interface WithDepth {
    depth: number;
}
export declare const compareByDepth: (a: VisualElement, b: VisualElement) => number;
