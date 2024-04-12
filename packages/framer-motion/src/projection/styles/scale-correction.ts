import { ScaleCorrectorMap } from "./types"

export const scaleCorrectors: ScaleCorrectorMap = {}

export function addScaleCorrector(correctors: ScaleCorrectorMap) {
    Object.assign(scaleCorrectors, correctors)
}
