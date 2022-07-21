import { warnOnce } from "../../utils/warn-once"
import { useScroll } from "../use-scroll"

/**
 * @deprecated useViewportScroll is deprecated. Convert to useScroll()
 */
export function useViewportScroll() {
    warnOnce(false, "useViewportScroll is deprecated. Convert to useScroll().")
    return useScroll()
}
