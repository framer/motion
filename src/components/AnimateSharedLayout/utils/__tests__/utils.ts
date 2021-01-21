import { Presence } from "../../types"
import { MotionValue, motionValue } from "../../../../value"
import { VisualElement } from "../../../../render/types"
import { htmlVisualElement } from "../../../../render/dom/html-visual-element"

export function makeChild(
    presence = Presence.Present,
    prevViewportBox?: any,
    box?: any,
    isPresenceRoot = true,
    opacity: MotionValue<number> = motionValue(0)
): VisualElement {
    const element = htmlVisualElement({ props: {} }, {})
    element.isPresent = presence !== Presence.Exiting
    element.isPresenceRoot = isPresenceRoot
    element.presence = presence
    element.prevViewportBox = prevViewportBox
    element.getProjection().layout = box
    element.addValue("opacity", opacity)

    return element
}
