import { RefObject } from "react"
import { warnOnce } from "../../utils/warn-once"
import { useScroll } from "../use-scroll"

/**
 * @deprecated useElementScroll is deprecated. Convert to useScroll({ container: ref })
 */
export function useElementScroll(ref: RefObject<HTMLElement>) {
    if (process.env.NODE_ENV === "development") {
        warnOnce(
            false,
            "useElementScroll is deprecated. Convert to useScroll({ container: ref })."
        )
    }

    return useScroll({ container: ref })
}
