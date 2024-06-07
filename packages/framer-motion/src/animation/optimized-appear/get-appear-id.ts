import { VisualElement } from "../../render/VisualElement"
import { optimizedAppearDataAttribute } from "./data-id"

export function getOptimisedAppearId(
    visualElement: VisualElement
): string | undefined {
    return visualElement.getProps()[optimizedAppearDataAttribute]
}
