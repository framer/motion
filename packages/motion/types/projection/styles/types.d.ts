import { IProjectionNode } from "../node/types";
export declare type ScaleCorrector = (latest: string | number, node: IProjectionNode) => string | number;
export interface ScaleCorrectorDefinition {
    correct: ScaleCorrector;
    applyTo?: string[];
}
export interface ScaleCorrectorMap {
    [key: string]: ScaleCorrectorDefinition;
}
