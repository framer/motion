import { FeatureBundle } from "../../motion/features/types"
import { MotionOneVisualElement } from "../waapi/MotionOneVisualElement"

/**
 * @public
 */
export const motionOne: FeatureBundle = {
    renderer: (_Component, config) => new MotionOneVisualElement(config) as any,
}
