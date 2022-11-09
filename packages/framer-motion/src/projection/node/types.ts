import { Transition } from "../../types"
import { ResolvedValues } from "../../render/types"
import { Box, Delta, Point } from "../geometry/types"
import { NodeStack } from "../shared/stack"
import { AnimationPlaybackControls } from "../../animation/animate"
import { FlatTree } from "../../render/utils/flat-tree"
import { InitialPromotionConfig } from "../../context/SwitchLayoutGroupContext"
import { MotionStyle } from "../../motion/types"
import type { VisualElement } from "../../render/VisualElement"

export type Position = "static" | "sticky" | "fixed"

export interface Snapshot {
    /**
     * The timestamp of the animation frame this snapshot was taken.
     * Used to prevent double snapshotting.
     */
    frameTimestamp: number

    /**
     * The measured viewport box returned from `getBoundingClientRect`. This
     * box still has transforms applied .
     */
    meaasuredViewportBox: Box

    /**
     * The viewport-relative box without tree transforms applied.
     */
    viewportBox: Box

    /**
     * The box in the flattened layout, without any scrolls or tree
     * transforms applied.
     */
    layoutBox: Box

    /**
     * Details of this bounding box relative to its nearest projecting parent.
     * If we can resolve this, it becomes possible to do relative layout
     * animations, so parent and child can have different transitions.
     */
    relative?: {
        parent: IProjectionNode
        box: Box
    }

    /**
     * The latest animations values at the time of this snapshot.
     */
    values: ResolvedValues

    /**
     * Whether the element is position sticky/fixed/static. The way we calculate
     * deltas depends on this.
     */
    position: Position

    /**
     * The origin of this snapshot. We currently keep this as a ProjectionNode
     * but this could be a unique identifier or otherwise - the important thing
     * is that it can fail an equality check if snapshots are from different sources.
     */
    origin: unknown
}

export type LayoutEvents =
    | "willUpdate"
    | "didUpdate"
    | "beforeMeasure"
    | "measure"
    | "projectionUpdate"
    | "animationStart"
    | "animationComplete"

export interface IProjectionNode<I = unknown> {
    id: number | undefined
    parent?: IProjectionNode
    relativeParent?: IProjectionNode
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

    snapshot?: Snapshot
    current?: Snapshot
    takeSnapshot(removeTreeTransform?: boolean): Snapshot

    target?: Box
    relativeTarget?: Box
    targetDelta?: Delta
    targetWithTransforms?: Box
    scroll?: Point
    isScrollRoot?: boolean
    treeScale?: Point
    projectionDelta?: Delta
    projectionDeltaWithTransform?: Delta
    latestValues: ResolvedValues
    isLayoutDirty: boolean
    shouldResetTransform: boolean
    prevTransformTemplateValue: string | undefined
    isUpdateBlocked(): boolean
    updateManuallyBlocked: boolean
    updateBlockedByResize: boolean
    blockUpdate(): void
    unblockUpdate(): void
    isUpdating: boolean
    needsReset: boolean
    startUpdate(): void
    willUpdate(notifyListeners?: boolean): void
    didUpdate(): void
    updateLayout(): void
    updateSnapshot(): void
    clearSnapshot(): void
    updateScroll(): void
    scheduleUpdateProjection(): void
    scheduleCheckAfterUnmount(): void
    checkUpdateFailed(): void
    potentialNodes: Map<number, IProjectionNode>
    sharedNodes: Map<string, NodeStack>
    registerPotentialNode(id: number, node: IProjectionNode): void
    registerSharedNode(id: string, node: IProjectionNode): void
    getStack(): NodeStack | undefined
    isVisible: boolean
    hide(): void
    show(): void
    scheduleRender(notifyAll?: boolean): void
    getClosestProjectingParent(): IProjectionNode | undefined

    setTargetDelta(delta: Delta): void
    resetTransform(): void
    resetRotation(): void
    applyTransform(box: Box, transformOnly?: boolean): Box
    resolveTargetDelta(): void
    calcProjection(): void
    getProjectionStyles(styles?: MotionStyle): MotionStyle | undefined
    clearMeasurements(): void
    resetTree(): void

    animationValues?: ResolvedValues
    currentAnimation?: AnimationPlaybackControls
    isTreeAnimating?: boolean
    isAnimationBlocked?: boolean
    isTreeAnimationBlocked: () => boolean
    setAnimationOrigin(delta: Delta): void
    startAnimation(transition: Transition): void
    finishAnimation(): void

    // Shared element
    isLead(): boolean
    promote(options?: {
        needsReset?: boolean
        transition?: Transition
        preserveFollowOpacity?: boolean
    }): void
    relegate(): boolean
    resumeFrom?: IProjectionNode
    resumingFrom?: IProjectionNode
    isPresent?: boolean

    addEventListener(name: LayoutEvents, handler: any): VoidFunction
    notifyListeners(name: LayoutEvents, ...args: any): void
    hasListeners(name: LayoutEvents): boolean

    preserveOpacity?: boolean
}

export interface LayoutUpdateData {
    layout: Box
    snapshot: Snapshot
    delta: Delta
    layoutDelta: Delta
    hasLayoutChanged: boolean
    hasRelativeTargetChanged: boolean
}

export type LayoutUpdateHandler = (data: LayoutUpdateData) => void

export interface ProjectionNodeConfig<I> {
    defaultParent?: () => IProjectionNode
    attachResizeListener?: (
        instance: I,
        notifyResize: VoidFunction
    ) => VoidFunction
    measureScroll: (instance: I) => Point
    checkIsScrollRoot: (instance: I) => boolean
    resetTransform?: (instance: I, value?: string) => void
    readPosition: (instance: I) => Position
}

export interface ProjectionNodeOptions {
    animate?: boolean
    layoutScroll?: boolean
    alwaysMeasureLayout?: boolean
    scheduleRender?: VoidFunction
    onExitComplete?: VoidFunction
    animationType?: "size" | "position" | "both" | "preserve-aspect"
    layoutId?: string
    layout?: boolean | string
    visualElement?: VisualElement
    crossfade?: boolean
    transition?: Transition
    initialPromotionConfig?: InitialPromotionConfig
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
