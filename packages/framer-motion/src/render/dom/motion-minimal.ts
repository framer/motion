import { createMotionProxy } from "./motion-proxy"
import { createDomMotionConfig } from "./utils/create-config"

/**
 * @public
 */
export const m = createMotionProxy(createDomMotionConfig as any)
