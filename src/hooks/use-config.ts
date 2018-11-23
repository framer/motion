import { useMemo } from "react"
import { PoseConfig, PoseConfigFactory, MotionProps } from "../motion/types"

const isResolver = (config: PoseConfig | PoseConfigFactory): config is PoseConfigFactory => typeof config === "function"

export const useConfig = (baseConfig: PoseConfig | PoseConfigFactory, props: MotionProps) => {
    return useMemo(() => (isResolver(baseConfig) ? baseConfig(props) : baseConfig), [])
}
