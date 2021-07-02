import { ResolvedValues } from "../../render/types"
import { SubscriptionManager } from "../../utils/subscription-manager"
import { Box, Delta, Point } from "../geometry/types"
import { NodeStack } from "../shared/stack"

export interface Snapshot {
    layout: Box
    visible: Box
}

export interface IProjectionNode<I = unknown> {
    id: number
    parent?: IProjectionNode
    root?: IProjectionNode
    children: Set<IProjectionNode>
    path: IProjectionNode[]
    mount: (node: I, isLayoutDirty?: boolean) => void
    options: ProjectionNodeOptions
    setOptions(options: ProjectionNodeOptions): void
    layout?: Box
    snapshot?: Snapshot
    target?: Box
    targetWithTransforms?: Box
    scroll?: Point
    treeScale?: Point
    projectionDelta?: Delta
    latestValues: ResolvedValues
    isLayoutDirty: boolean
    shouldResetTransform: boolean
    isUpdating: boolean
    startUpdate(): void
    willUpdate(notifyListeners?: boolean): void
    didUpdate(): void
    updateLayout(): void
    updateSnapshot(): void
    updateScroll(): void
    scheduleUpdateProjection(): void
    potentialNodes: Map<number, IProjectionNode>
    sharedNodes: Map<string, NodeStack>
    registerPotentialNode(id: number, node: IProjectionNode): void
    registerSharedNode(id: string, node: IProjectionNode): void
    getStack(): NodeStack | undefined

    setTargetDelta(delta: Delta): void
    resetTransform(): void
    resolveTargetDelta(): void
    calcProjection(): void
    getProjectionStyles(): ResolvedValues

    // Shared element
    isLead(node: IProjectionNode, layoutId: string): boolean

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
    resetTransform?: (instance: I) => void
}

export interface ProjectionNodeOptions {
    shouldMeasureScroll?: boolean
    onProjectionUpdate?: () => void
    animationType?: "size" | "position" | "both"
    layoutId?: string
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
