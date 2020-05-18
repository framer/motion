import { Presence } from "../types"

let id = 0

export function makeChild(
    presence = Presence.Present,
    measuredOrigin?: any,
    measuredTarget?: any
) {
    id++
    return {
        id,
        isPresent: () => presence !== Presence.Exiting,
        presence,
        measuredOrigin,
        measuredTarget,
        shouldAnimate: true,
        props: {},
    }
}
