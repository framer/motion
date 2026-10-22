"use client"

import { drag } from "../../motion/features/drag"
import { layout } from "../../motion/features/layout"
import { FeatureBundle } from "../../motion/features/types"
import { domAnimation } from "./features-animation"

/**
 * @public
 */
export const domMax: FeatureBundle = /* @__PURE__ */ Object.assign(
    {},
    domAnimation,
    drag,
    layout
)
