import { AnimationFeature } from "./AnimationFeature"
import { ExitAnimationFeature } from "./ExitAnimationFeature"
import { FeaturePackages } from "./types"

export const animations: FeaturePackages = {
    animation: {
        Feature: AnimationFeature,
    },
    exit: {
        Feature: ExitAnimationFeature,
    },
}
