import type {
    AnimationScope,
    ElementOrSelector,
} from "../../../animation/types"
import { invariant } from "../../../utils/errors"

export interface WithQuerySelectorAll {
    querySelectorAll: Element["querySelectorAll"]
}

export function resolveElements(
    elements: ElementOrSelector,
    scope?: AnimationScope,
    selectorCache?: { [key: string]: NodeListOf<Element> }
): Element[] {
    if (typeof elements === "string") {
        let root: WithQuerySelectorAll = document

        if (scope) {
            invariant(
                Boolean(scope.current),
                "Scope provided, but no element detected."
            )
            root = scope.current
        }

        if (selectorCache) {
            selectorCache[elements] ??= root.querySelectorAll(elements)
            elements = selectorCache[elements]
        } else {
            elements = root.querySelectorAll(elements)
        }
    } else if (elements instanceof Element) {
        elements = [elements]
    }

    /**
     * Return an empty array
     */
    return Array.from(elements || [])
}
