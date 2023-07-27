import { memo } from "../../../utils/memo"

export const supportsScrollTimeline = memo(
    () => window.ScrollTimeline !== undefined
)
