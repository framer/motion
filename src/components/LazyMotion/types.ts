import { FeatureBundle } from "../../motion/features/types"

export type LazyFeatureBundle = () => Promise<FeatureBundle>

/**
 * @public
 */
export interface LazyProps {
    children?: React.ReactNode
    features: FeatureBundle | LazyFeatureBundle
    strict?: boolean
}
