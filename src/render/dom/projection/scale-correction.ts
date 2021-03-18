import { ScaleCorrectionDefinitionMap } from "./types"

export const valueScaleCorrection: ScaleCorrectionDefinitionMap = {}

/**
 * @internal
 */
export function addScaleCorrection(correctors: ScaleCorrectionDefinitionMap) {
    for (const key in correctors) {
        valueScaleCorrection[key] = correctors[key]
    }
}
