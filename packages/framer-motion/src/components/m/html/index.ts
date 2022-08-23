import { createMotionProxy } from "../../../render/dom/motion-proxy"
import { htmlMotionConfig } from "../../../render/html/config-motion"
import { useHTMLProps } from "../../../render/html/use-props"
import { createDomMotionConfig } from "../shared/create-config"

export const m = createMotionProxy(
    createDomMotionConfig(htmlMotionConfig, useHTMLProps) as any
)
