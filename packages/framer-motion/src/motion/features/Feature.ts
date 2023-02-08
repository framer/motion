import type {
    VisualElement as MotionNode,
    MotionNodeProps,
} from "../../render/VisualElement"

export abstract class Feature<T> {
    isMounted = false

    node: MotionNode<T>

    constructor(node: MotionNode<T>) {
        this.node = node
    }

    abstract mount(): void

    abstract unmount(): void

    update(_newProps: MotionNodeProps, _prevProps?: MotionNodeProps): void {}
}
