import { IProjectionNode } from "../node/types"

export type ScaleCorrector = (
    latest: string | number,
    node: IProjectionNode
) => string | number

export interface ScaleCorrectorDefinition {
    correct: ScaleCorrector
    applyTo?: string[]
}

export interface ScaleCorrectorMap {
    [key: string]: ScaleCorrectorDefinition
}

// export type ScaleCorrection = (
//     latest: string | number,
//     layoutState: LayoutState,
//     projection: TargetProjection
// ) => string | number

// export interface ScaleCorrectionDefinition {
//     process: ScaleCorrection
//     applyTo?: string[]
// }

// export type ScaleCorrectionDefinitionMap = {
//     [key: string]: ScaleCorrectionDefinition
// }
