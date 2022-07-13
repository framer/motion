import { warnOnce } from "../../utils/warn-once"
import { useScroll } from "../use-scroll"

export function useViewportScroll() {
    warnOnce(false, "useViewportScroll is deprecated. Convert to useScroll().")
    return useScroll()
}
