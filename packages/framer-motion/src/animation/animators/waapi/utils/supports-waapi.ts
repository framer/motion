import { memo } from "../../../../utils/memo"

export const supportsWaapi = /*@__PURE__*/ memo(() =>
    Object.hasOwnProperty.call(Element.prototype, "animate")
)
