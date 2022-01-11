import * as React from "react";
import { startAnimation } from "../animation/utils/transitions";
import { MotionProps, MotionStyle } from "../motion/types";
import { VisualState } from "../motion/utils/use-visual-state";
import { TargetAndTransition, Transition, Variant } from "../types";
import { MotionValue } from "../value";
import { AnimationState } from "./utils/animation-state";
import { LifecycleManager } from "./utils/lifecycles";
import { Box, Point, TransformPoint } from "../projection/geometry/types";
import { IProjectionNode } from "../projection/node/types";
import { MotionConfigProps } from "../components/MotionConfig";
export interface MotionPoint {
    x: MotionValue<number>;
    y: MotionValue<number>;
}
export interface VisualElement<Instance = any, RenderState = any> extends LifecycleManager {
    treeType: string;
    depth: number;
    parent?: VisualElement;
    children: Set<VisualElement>;
    variantChildren?: Set<VisualElement>;
    current: Instance | null;
    manuallyAnimateOnMount: boolean;
    blockInitialAnimation?: boolean;
    presenceId: number | undefined;
    isMounted(): boolean;
    mount(instance: Instance): void;
    unmount(): void;
    isStatic?: boolean;
    getInstance(): Instance | null;
    sortNodePosition(element: VisualElement): number;
    measureViewportBox(withTransform?: boolean): Box;
    addVariantChild(child: VisualElement): undefined | (() => void);
    getClosestVariantNode(): VisualElement | undefined;
    animateMotionValue?: typeof startAnimation;
    projection?: IProjectionNode;
    /**
     * Visibility
     */
    isVisible?: boolean;
    setVisibility(visibility: boolean): void;
    hasValue(key: string): boolean;
    addValue(key: string, value: MotionValue<any>): void;
    removeValue(key: string): void;
    getValue(key: string): undefined | MotionValue;
    getValue(key: string, defaultValue: string | number): MotionValue;
    getValue(key: string, defaultValue?: string | number): undefined | MotionValue;
    forEachValue(callback: (value: MotionValue, key: string) => void): void;
    readValue(key: string): string | number | undefined | null;
    setBaseTarget(key: string, value: string | number | null): void;
    getBaseTarget(key: string): number | string | undefined | null;
    getStaticValue(key: string): number | string | undefined;
    setStaticValue(key: string, value: number | string): void;
    getLatestValues(): ResolvedValues;
    scheduleRender(): void;
    makeTargetAnimatable(target: TargetAndTransition, isLive?: boolean): TargetAndTransition;
    setProps(props: MotionProps): void;
    getProps(): MotionProps;
    getVariant(name: string): Variant | undefined;
    getDefaultTransition(): Transition | undefined;
    getVariantContext(startAtParent?: boolean): undefined | {
        initial?: string | string[];
        animate?: string | string[];
        exit?: string | string[];
        whileHover?: string | string[];
        whileDrag?: string | string[];
        whileFocus?: string | string[];
        whileTap?: string | string[];
    };
    getTransformPagePoint: () => TransformPoint | undefined;
    build(): RenderState;
    syncRender(): void;
    isPresenceRoot?: boolean;
    isPresent?: boolean;
    prevDragCursor?: Point;
    getLayoutId(): string | undefined;
    animationState?: AnimationState;
}
export interface VisualElementConfig<Instance, RenderState, Options> {
    treeType?: string;
    getBaseTarget?(props: MotionProps, key: string): string | number | undefined | MotionValue;
    build(visualElement: VisualElement<Instance>, renderState: RenderState, latestValues: ResolvedValues, options: Options, props: MotionProps): void;
    sortNodePosition?: (a: Instance, b: Instance) => number;
    makeTargetAnimatable(element: VisualElement<Instance>, target: TargetAndTransition, props: MotionProps, isLive: boolean): TargetAndTransition;
    measureViewportBox(instance: Instance, props: MotionProps & MotionConfigProps): Box;
    readValueFromInstance(instance: Instance, key: string, options: Options): string | number | null | undefined;
    resetTransform(element: VisualElement<Instance>, instance: Instance, props: MotionProps): void;
    restoreTransform(instance: Instance, renderState: RenderState): void;
    render(instance: Instance, renderState: RenderState, styleProp?: MotionStyle, projection?: IProjectionNode): void;
    removeValueFromRenderState(key: string, renderState: RenderState): void;
    scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps;
}
export declare type ScrapeMotionValuesFromProps = (props: MotionProps) => {
    [key: string]: MotionValue | string | number;
};
export declare type UseRenderState<RenderState = any> = () => RenderState;
export declare type VisualElementOptions<Instance, RenderState = any> = {
    visualState: VisualState<Instance, RenderState>;
    parent?: VisualElement<unknown>;
    variantParent?: VisualElement<unknown>;
    presenceId?: number | undefined;
    props: MotionProps;
    blockInitialAnimation?: boolean;
};
export declare type CreateVisualElement<Instance> = (Component: string | React.ComponentType, options: VisualElementOptions<Instance>) => VisualElement<Instance>;
/**
 * A generic set of string/number values
 */
export interface ResolvedValues {
    [key: string]: string | number;
}
