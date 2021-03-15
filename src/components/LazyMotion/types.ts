import { FeatureBundle, LazyFeatureBundle } from "../../motion/features/types"

/**
 * @public
 */
export interface LazyProps {
    renderer: () => {}
    animation?: null | FeatureBundle | LazyFeatureBundle
    gestures?: null | FeatureBundle | LazyFeatureBundle
    drag?: null | FeatureBundle | LazyFeatureBundle
    layoutAnimation?: null | FeatureBundle | LazyFeatureBundle
}
