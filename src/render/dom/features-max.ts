import { drag } from "../../motion/features/drag"
import { layoutAnimations } from "../../motion/features/layout"
import { FeatureBundle } from "../../motion/features/types"
import { domAnimation } from "./features-animation"

/**
 * @public
 */
export const domMax: FeatureBundle = {
    ...domAnimation,
    ...drag,
    ...layoutAnimations,
}
