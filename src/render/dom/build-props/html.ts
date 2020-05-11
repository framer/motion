import { ResolvedValues } from "./types"
import { MotionProps } from "../../../motion/types"
import { buildStyleProp } from "./style"

export function buildHTMLProps(
    latest: ResolvedValues,
    { drag, transformTemplate }: MotionProps,
    enableHardwareAcceleration: boolean = true
) {
    // The `any` isn't ideal but it is the type of createElement props argument
    const htmlProps: any = {
        style: buildStyleProp(latest, {
            enableHardwareAcceleration,
            transformTemplate,
        }),
    }

    if (!!drag) {
        // Disable text selection
        htmlProps.style.userSelect = "none"

        // Disable the ghost element when a user drags
        htmlProps.draggable = false
    }

    return htmlProps
}
