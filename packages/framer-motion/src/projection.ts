export { HTMLProjectionNode } from "./projection/node/HTMLProjectionNode"
export { nodeGroup } from "./projection/node/group"
export { calcBoxDelta } from "./projection/geometry/delta-calc"

/**
 * For debugging purposes
 */
import { frame, frameData } from "./frameloop"
import { mix } from "./utils/mix"
import { animateValue } from "./animation/animators/MainThreadAnimation"
export { frame, animateValue as animate, mix, frameData }
export { buildTransform } from "./render/html/utils/build-transform"
export { addScaleCorrector } from "./projection/styles/scale-correction"
export { correctBorderRadius } from "./projection/styles/scale-border-radius"
export { correctBoxShadow } from "./projection/styles/scale-box-shadow"
export { HTMLVisualElement } from "./render/html/HTMLVisualElement"
