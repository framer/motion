import { featureDefinitions } from "./definitions"
import { FeaturePackages } from "./types"

export function loadFeatures(features: FeaturePackages) {
    for (const key in features) {
        featureDefinitions[key] = {
            ...featureDefinitions[key],
            ...features[key],
        }
    }
}
