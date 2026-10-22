"use client"

import { animations } from "../../motion/features/animations"
import { gestureAnimations } from "../../motion/features/gestures"
import { FeatureBundle } from "../../motion/features/types"
import { createDomVisualElement } from "./create-visual-element"

/**
 * @public
 */
export const domAnimation: FeatureBundle = /* @__PURE__ */ Object.assign(
    { renderer: createDomVisualElement },
    animations,
    gestureAnimations
)
