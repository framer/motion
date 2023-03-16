import type { ElementOrSelector } from "../../../animation/types"
import { invariant } from "../../../utils/errors"

export interface WithQuerySelectorAll {
    querySelectorAll: Element["querySelectorAll"]
}

export type GetAnimateScope = () => WithQuerySelectorAll

const defaultScope: GetAnimateScope = () => document

export function resolveElements(
    elements: ElementOrSelector,
    getScope = defaultScope,
    selectorCache?: { [key: string]: NodeListOf<Element> }
): Element[] {
    if (typeof elements === "string") {
        const scope = getScope()

        invariant(Boolean(scope), "No scope defined.")

        if (selectorCache) {
            selectorCache[elements] ??= scope.querySelectorAll(elements)
            elements = selectorCache[elements]
        } else {
            elements = scope.querySelectorAll(elements)
        }
    } else if (elements instanceof Element) {
        elements = [elements]
    }

    /**
     * Return an empty array
     */
    return Array.from(elements || [])
}
