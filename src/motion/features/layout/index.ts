import { FeatureBundle } from "../types"
import { AnimateLayoutContextProvider } from "./Animate"
import { MeasureContextProvider } from "./Measure"

export const layoutAnimations: FeatureBundle = {
    measureLayout: MeasureContextProvider,
    layoutAnimation: AnimateLayoutContextProvider,
}
