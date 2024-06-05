import type { CreateVisualElement, ResolvedValues, MotionProps } from "framer-motion";
import { VisualElement } from "framer-motion";
import { Object3DNode } from "@react-three/fiber";
import { ThreeRenderState } from "../types";
export declare const createRenderState: () => {};
export declare class ThreeVisualElement extends VisualElement<Object3DNode<any, any>, ThreeRenderState, {}> {
    type: string;
    readValueFromInstance(instance: Object3DNode<any, any>, key: string): string | number | undefined;
    getBaseTargetFromProps(): undefined;
    sortInstanceNodePosition(a: Object3DNode<any, any>, b: Object3DNode<any, any>): number;
    removeValueFromRenderState(): void;
    measureInstanceViewportBox(): import("framer-motion").Box;
    scrapeMotionValuesFromProps(props: MotionProps, prevProps: MotionProps): {
        [key: string]: string | number | import("framer-motion").MotionValue<any>;
    };
    build(state: ThreeRenderState, latestValues: ResolvedValues): void;
    renderInstance(instance: Object3DNode<any, any>, renderState: ThreeRenderState): void;
}
export declare const createVisualElement: CreateVisualElement<any>;
