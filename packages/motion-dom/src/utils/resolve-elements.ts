export type ElementOrSelector =
    | Element
    | Element[]
    | NodeListOf<Element>
    | string

export interface WithQuerySelectorAll {
    querySelectorAll: Element["querySelectorAll"]
}

export interface AnimationScope<T = any> {
    readonly current: T
    animations: any[] // TODO: Refactor to types package AnimationPlaybackControls[]
}

export interface SelectorCache {
    [key: string]: NodeListOf<Element>
}

export function resolveElements(
    elementOrSelector: ElementOrSelector,
    scope?: AnimationScope,
    selectorCache?: SelectorCache
): Element[] {
    if (elementOrSelector instanceof Element) {
        return [elementOrSelector]
    } else if (typeof elementOrSelector === "string") {
        let root: WithQuerySelectorAll = document

        if (scope) {
            // TODO: Refactor to utils package
            // invariant(
            //     Boolean(scope.current),
            //     "Scope provided, but no element detected."
            // )
            root = scope.current
        }

        const elements =
            selectorCache?.[elementOrSelector] ??
            root.querySelectorAll(elementOrSelector)

        return elements ? Array.from(elements) : []
    }

    return Array.from(elementOrSelector)
}
