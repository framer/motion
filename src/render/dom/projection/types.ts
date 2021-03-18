import { LayoutState, TargetProjection } from "../../utils/state"

export type ScaleCorrection = (
    latest: string | number,
    layoutState: LayoutState,
    projection: TargetProjection
) => string | number

export interface ScaleCorrectionDefinition {
    process: ScaleCorrection
    applyTo?: string[]
}

export type ScaleCorrectionDefinitionMap = {
    [key: string]: ScaleCorrectionDefinition
}
