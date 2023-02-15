import { AnimationFeature } from "./animation"
import { ExitAnimationFeature } from "./animation/exit"
import { FeaturePackages } from "./types"

export const animations: FeaturePackages = {
    animation: {
        Feature: AnimationFeature,
    },
    exit: {
        Feature: ExitAnimationFeature,
    },
}
