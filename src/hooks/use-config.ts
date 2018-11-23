import { useMemo } from "react"
import { PoseConfig, PoseConfigFactory, MotionProps } from "../motion/types"

const isResolver = (config: PoseConfig | PoseConfigFactory): config is PoseConfigFactory => typeof config === "function"

const useConfig = (baseConfig: PoseConfig | PoseConfigFactory, props: MotionProps) =>
    useMemo(() => (isResolver(baseConfig) ? baseConfig(props) : baseConfig), [])

export default useConfig
