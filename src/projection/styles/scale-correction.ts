import { ScaleCorrectorMap } from "./types"

export const scaleCorrectors = {}

export function addScaleCorrector(correctors: ScaleCorrectorMap) {
    Object.assign(scaleCorrectors, correctors)
}
