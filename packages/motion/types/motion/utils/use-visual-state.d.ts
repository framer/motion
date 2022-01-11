import { ResolvedValues, ScrapeMotionValuesFromProps } from "../../render/types";
import { MotionProps } from "../types";
export interface VisualState<Instance, RenderState> {
    renderState: RenderState;
    latestValues: ResolvedValues;
    mount?: (instance: Instance) => void;
}
export declare type UseVisualState<Instance, RenderState> = (props: MotionProps, isStatic: boolean) => VisualState<Instance, RenderState>;
export interface UseVisualStateConfig<Instance, RenderState> {
    scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps;
    createRenderState: () => RenderState;
    onMount?: (props: MotionProps, instance: Instance, visualState: VisualState<Instance, RenderState>) => void;
}
export declare const makeUseVisualState: <I, RS>(config: UseVisualStateConfig<I, RS>) => UseVisualState<I, RS>;
