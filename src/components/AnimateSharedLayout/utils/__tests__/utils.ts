import { Presence } from "../../types"
import { HTMLVisualElement } from "../../../../render/dom/HTMLVisualElement"
import { MotionValue, motionValue } from "../../../../value"

export function makeChild(
    presence = Presence.Present,
    prevViewportBox?: any,
    box?: any,
    isPresenceRoot = true,
    opacity: MotionValue<number> = motionValue(0)
): HTMLVisualElement {
    const element = new HTMLVisualElement()
    element.isPresent = presence !== Presence.Exiting
    element.isPresenceRoot = isPresenceRoot
    element.presence = presence
    element.prevViewportBox = prevViewportBox
    element.box = box
    element.addValue("opacity", opacity)

    return element
}
