import { Box, Delta, Point } from "../geometry/types"

export interface Snapshot {
    layout: Box
    visible: Box
}

export interface IProjectionNode<I = unknown> {
    parent?: IProjectionNode
    root?: IProjectionNode
    children: Set<IProjectionNode>
    path: IProjectionNode[]
    mount: (node: I) => void
    options: ProjectionNodeOptions
    setOptions(options: ProjectionNodeOptions): void
    layout?: Box
    snapshot?: Snapshot
    scroll?: Point
    projectionDelta?: Delta
    isLayoutDirty: boolean
    willUpdate(notifyListeners?: boolean): void
    didUpdate(): void
    updateLayout(): void
    updateScroll(): void
    scheduleUpdateProjection(): void
    setTargetDelta(delta: Delta): void
    resolveTargetDelta(): void
    calcProjection(): void

    /**
     * Events
     */
    onLayoutWillUpdate: (callback: VoidFunction) => VoidFunction
}

export interface ProjectionNodeConfig<I> {
    defaultParent?: () => IProjectionNode
    attachResizeListener?: (
        instance: I,
        notifyResize: VoidFunction
    ) => VoidFunction
    measureScroll: (instance: I) => Point
    measureViewportBox?: (instance: I) => Box
}

export interface ProjectionNodeOptions {
    shouldMeasureScroll?: boolean
    onLayoutUpdate?: (data: {
        layout: Box
        snapshot: Snapshot
        delta: Delta
        hasLayoutChanged: boolean
    }) => void
    onProjectionUpdate?: () => void
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
