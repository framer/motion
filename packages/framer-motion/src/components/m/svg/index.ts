import { createMotionProxy } from "../../../render/dom/motion-proxy"
import { svgMotionConfig } from "../../../render/svg/config-motion"
import { useSVGProps } from "../../../render/svg/use-props"
import { createDomMotionConfig } from "../shared/create-config"

export const mSVG = createMotionProxy(
    createDomMotionConfig(svgMotionConfig, useSVGProps) as any
)
