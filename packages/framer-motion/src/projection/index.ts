export { HTMLProjectionNode } from "./node/HTMLProjectionNode"
export { nodeGroup } from "./node/group"
export { calcBoxDelta } from "./geometry/delta-calc"

/**
 * For debugging purposes
 */
import sync from "framesync"
import { mix } from "../utils/mix"
import { animate } from "../animation/legacy-popmotion/index"
export { sync, animate, mix }
export { buildTransform } from "../render/html/utils/build-transform"
export { addScaleCorrector } from "./styles/scale-correction"
export { correctBorderRadius } from "./styles/scale-border-radius"
export { correctBoxShadow } from "./styles/scale-box-shadow"
export { HTMLVisualElement } from "../render/html/HTMLVisualElement"
