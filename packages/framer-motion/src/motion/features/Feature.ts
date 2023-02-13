import type { VisualElement } from "../../render/VisualElement"

export abstract class Feature<T> {
    isMounted = false

    node: VisualElement<T>

    constructor(node: VisualElement<T>) {
        this.node = node
    }

    abstract mount(): void

    abstract unmount(): void

    update(): void {}
}
