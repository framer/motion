import { featureDefinitions } from "./definitions"
import { FeatureComponents } from "./types"

export function loadFeatures(features: FeatureComponents) {
    for (const key in features) {
        if (key === "projectionNodeConstructor") {
            featureDefinitions.projectionNodeConstructor = features[key]
        } else {
            featureDefinitions[key].Component = features[key]
        }
    }
}
