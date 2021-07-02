import { motionTags } from "./motion-tags"
import { domTags } from "./dom-tags"

// tree-shakable patch for legacy browsers which don't support Proxy
export const patchMotionTags = (() => {
    motionTags.push(...domTags)
    return () => {}
})()
