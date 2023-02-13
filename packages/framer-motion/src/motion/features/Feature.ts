import type {
    VisualElement,
    VisualElementProps,
} from "../../render/VisualElement"

export abstract class Feature<T> {
    isMounted = false

    node: VisualElement<T>

    constructor(node: VisualElement<T>) {
        this.node = node
    }

    abstract mount(): void

    abstract unmount(): void

    update(
        _newProps: VisualElementProps,
        _prevProps?: VisualElementProps
    ): void {}
}
