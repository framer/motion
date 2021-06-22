import { ResolvedValues } from "../../render/types"
import { SubscriptionManager } from "../../utils/subscription-manager"
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
    target?: Box
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
    getProjectionStyles(latest: ResolvedValues): ResolvedValues

    /**
     * Events
     */
    onLayoutWillUpdate: (callback: VoidFunction) => VoidFunction
    onLayoutDidUpdate: (
        callback: (data: LayoutUpdateData) => void
    ) => VoidFunction
    layoutDidUpdateListeners?: SubscriptionManager<LayoutUpdateHandler>
}

export interface LayoutUpdateData {
    layout: Box
    snapshot: Snapshot
    delta: Delta
    hasLayoutChanged: boolean
}

export type LayoutUpdateHandler = (data: LayoutUpdateData) => void

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
    onProjectionUpdate?: () => void
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
