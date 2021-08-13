import { Transition } from "../../types"
import { ResolvedValues, VisualElement } from "../../render/types"
import { Box, Delta, Point } from "../geometry/types"
import { NodeStack } from "../shared/stack"
import { AnimationPlaybackControls } from "../../animation/animate"
import { FlatTree } from "../../render/utils/flat-tree"

// TODO: Find more appropriate names for each snapshot
export interface Snapshot {
    measured: Box
    layout: Box
    visible: Box
    latestValues: ResolvedValues
    isShared?: boolean
}

export type LayoutEvents =
    | "willUpdate"
    | "didUpdate"
    | "measure"
    | "animationComplete"

export interface IProjectionNode<I = unknown> {
    id: number | undefined
    parent?: IProjectionNode
    root?: IProjectionNode
    children: Set<IProjectionNode>
    path: IProjectionNode[]
    nodes?: FlatTree
    depth: number
    instance: I
    mount: (node: I, isLayoutDirty?: boolean) => void
    unmount: () => void
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
    updateBlocked: boolean
    blockUpdate(): void
    unblockUpdate(): void
    isUpdating: boolean
    needsReset: boolean
    startUpdate(): void
    willUpdate(notifyListeners?: boolean): void
    didUpdate(): void
    measure(): Box
    updateLayout(): void
    updateSnapshot(): void
    clearSnapshot(): void
    updateScroll(): void
    scheduleUpdateProjection(): void
    potentialNodes: Map<number, IProjectionNode>
    sharedNodes: Map<string, NodeStack>
    registerPotentialNode(id: number, node: IProjectionNode): void
    registerSharedNode(id: string, node: IProjectionNode): void
    getStack(): NodeStack | undefined
    isVisible: boolean
    hide(): void
    show(): void
    scheduleRender(notifyAll?: boolean): void

    setTargetDelta(delta: Delta): void
    resetTransform(): void
    resetRotation(): void
    applyTransform(box: Box): Box
    resolveTargetDelta(): void
    calcProjection(): void
    getProjectionStyles(): ResolvedValues
    clearMeasurements(): void

    animationValues?: ResolvedValues
    currentAnimation?: AnimationPlaybackControls
    setAnimationOrigin(delta: Delta): void
    startAnimation(transition: Transition): void
    finishAnimation(): void

    // Shared element
    isLead(): boolean
    promote(options?: { needsReset?: boolean; transition?: Transition }): void
    relegate(): boolean
    resumeFrom?: IProjectionNode
    resumingFrom?: IProjectionNode
    isPresent?: boolean

    addEventListener(name: LayoutEvents, handler: VoidFunction): VoidFunction
    notifyListeners(name: LayoutEvents, ...args: any): void
    hasListeners(name: LayoutEvents): boolean
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
    resetTransform?: (instance: I, value?: string) => void
}

export interface ProjectionNodeOptions {
    animate?: boolean
    shouldMeasureScroll?: boolean
    alwaysMeasureLayout?: boolean
    scheduleRender?: VoidFunction
    onExitComplete?: VoidFunction
    onProjectionUpdate?(box: Box, delta: Delta): void
    animationType?: "size" | "position" | "both"
    layoutId?: string
    layout?: boolean | string
    visualElement?: VisualElement
    crossfade?: boolean
    transition?: Transition
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
