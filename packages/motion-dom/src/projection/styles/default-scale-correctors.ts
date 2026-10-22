import { cornerRadiusProps } from "../../utils/border-radius"
import { correctBorderRadius } from "./scale-border-radius"
import { correctBoxShadow } from "./scale-box-shadow"
import type { ScaleCorrectorMap } from "./types"

export const defaultScaleCorrectors: ScaleCorrectorMap = {
    borderRadius: /* @__PURE__ */ Object.assign({}, correctBorderRadius, {
        applyTo: /* @__PURE__ */ cornerRadiusProps.slice(),
    }),
    borderTopLeftRadius: correctBorderRadius,
    borderTopRightRadius: correctBorderRadius,
    borderBottomLeftRadius: correctBorderRadius,
    borderBottomRightRadius: correctBorderRadius,
    boxShadow: correctBoxShadow,
}
