import { memo } from "../../../../utils/memo"

export const supportsPartialKeyframes = /*@__PURE__*/ memo(() => {
    try {
        document.createElement("div").animate({ opacity: [1] })
    } catch (e) {
        return false
    }
    return true
})
