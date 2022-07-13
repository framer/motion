import { RefObject } from "react"
import { warnOnce } from "../../utils/warn-once"
import { useScroll } from "../use-scroll"

export function useElementScroll(ref: RefObject<HTMLElement>) {
    warnOnce(
        false,
        "useElementScroll is deprecated. Convert to useScroll({ container: ref })."
    )
    return useScroll({ container: ref })
}
