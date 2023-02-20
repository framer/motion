export { HTMLProjectionNode } from "./node/HTMLProjectionNode"
export { nodeGroup } from "./node/group"
export { calcBoxDelta } from "./geometry/delta-calc"

/**
 * For debugging purposes
 */
import { sync } from "../frameloop"
import { mix } from "../utils/mix"
import { animateValue } from "../animation/legacy-popmotion/index"
export { sync, animateValue as animate, mix }
export { buildTransform } from "../render/html/utils/build-transform"
export { addScaleCorrector } from "./styles/scale-correction"
export { correctBorderRadius } from "./styles/scale-border-radius"
export { correctBoxShadow } from "./styles/scale-box-shadow"
export { HTMLVisualElement } from "../render/html/HTMLVisualElement"
