import { drag } from "../../motion/features/drag"
import { layoutFeatures } from "../../motion/features/layout"
import { FeatureBundle } from "../../motion/features/types"
import { HTMLProjectionNode } from "../../projection"
import { domAnimation } from "./features-animation"

/**
 * @public
 */
export const domMax: FeatureBundle = {
    ...domAnimation,
    ...drag,
    ...layoutFeatures,
    projectionNodeConstructor: HTMLProjectionNode,
}
