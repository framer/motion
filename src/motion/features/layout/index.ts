import { FeatureComponents } from "../types"
import { AnimateLayoutContextProvider } from "./Animate"
import { MeasureContextProvider } from "./Measure"

export const layoutAnimations: FeatureComponents = {
    measureLayout: MeasureContextProvider,
    layoutAnimation: AnimateLayoutContextProvider,
}
