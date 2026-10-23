import type { JSAnimation } from "../../animation/JSAnimation"
import type {
    MotionPath,
    Transition,
    ValueTransition,
} from "../../animation/types"
import type { ResolvedValues } from "../../render/types"
import type { VisualElement, MotionStyle } from "../../render/VisualElement"
import { Box, Delta, Point } from "motion-utils"
import { FlatTree } from "../utils/flat-tree"
import { NodeStack } from "../shared/stack"
import type { Mat3 } from "../quad/mat3"
import type { Quad } from "../quad/quad"
import type { QuadProjection } from "./quad-projection"
import type { SpaceMeasurement } from "../quad/measure-space"

/**
 * How a node is drawn when a box can't describe it: inside a rotated,
 * skewed or 3D space, or (for snapshots) under rotated ancestors.
 */
export interface QuadMeasurements {
    /**
     * The node's untransformed box on the page.
     */
    rect: Box

    /**
     * Transforms Motion doesn't control, between the node's projection
     * parent and the node, as a page-space homography.
     */
    env: Mat3

    /**
     * `perspective` on the node's parent: distance (0 if none), then its
     * page origin.
     */
    perspective: Float64Array

    /**
     * Whether the space the node is drawn in isn't axis-aligned.
     */
    isQuadSpace: boolean

    /**
     * For snapshots, the corners the node was visible at.
     */
    visual?: Quad
}

export interface Measurements {
    animationId: number
    measuredBox: Box
    layoutBox: Box
    latestValues: ResolvedValues
    source: number
    quad?: QuadMeasurements
}

export type Phase = "snapshot" | "measure"

export interface ScrollMeasurements {
    animationId: number
    phase: Phase
    offset: Point
    isRoot: boolean
    wasRoot: boolean
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
    id: number
    animationId: number
    animationCommitId: number
    parent?: IProjectionNode
    relativeParent?: IProjectionNode
    root?: IProjectionNode
    children: Set<IProjectionNode>
    path: IProjectionNode[]
    nodes?: FlatTree
    depth: number
    instance: I | undefined
    mount: (node: I, isLayoutDirty?: boolean) => void
    unmount: () => void
    options: ProjectionNodeOptions
    setOptions(options: ProjectionNodeOptions): void
    layout?: Measurements
    dragSnapshot?: Measurements
    dragAncestor?: IProjectionNode
    snapshot?: Measurements
    target?: Box
    relativeTarget?: Box
    relativeTargetOrigin?: Box
    targetDelta?: Delta
    targetWithTransforms?: Box
    scroll?: ScrollMeasurements
    treeScale?: Point
    projectionDelta?: Delta
    projectionDeltaWithTransform?: Delta
    quad?: QuadProjection
    isSVG?: boolean
    applyTransformsToTarget(): void
    latestValues: ResolvedValues
    isLayoutDirty: boolean
    isProjectionDirty: boolean
    isSharedProjectionDirty: boolean
    isTransformDirty: boolean
    resolvedRelativeTargetAt?: number
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
    measure(removeTransform?: boolean): Measurements
    measurePageBox(): Box
    updateLayout(): void
    updateSnapshot(): void
    clearSnapshot(): void
    updateScroll(phase?: Phase): void
    scheduleUpdateProjection(): void
    scheduleCheckAfterUnmount(): void
    checkUpdateFailed(): void
    sharedNodes: Map<string, NodeStack>
    registerSharedNode(id: string, node: IProjectionNode): void
    getStack(): NodeStack | undefined
    getLead(): IProjectionNode
    isVisible: boolean
    hide(): void
    show(): void
    scheduleRender(notifyAll?: boolean): void
    getClosestProjectingParent(): IProjectionNode | undefined

    setTargetDelta(delta: Delta): void
    resetTransform(): void
    resetSkewAndRotation(): void
    applyTransform(
        box: Box,
        transformOnly?: boolean,
        output?: Box,
        skipOwnTransform?: boolean
    ): Box
    resolveTargetDelta(force?: boolean): void
    removeRelativeTarget(): void
    calcProjection(): void
    applyProjectionStyles(
        targetStyle: CSSStyleDeclaration,
        styleProp?: MotionStyle
    ): void
    clearMeasurements(): void
    resetTree(): void

    isProjecting(): boolean
    animationValues?: ResolvedValues
    currentAnimation?: JSAnimation<number>
    isTreeAnimating?: boolean
    isAnimationBlocked?: boolean
    setAnimationOrigin(
        delta: Delta,
        hasOnlyRelativeTargetChanged?: boolean,
        pathFn?: MotionPath
    ): void
    startAnimation(transition: ValueTransition): void
    finishAnimation(): void
    hasCheckedOptimisedAppear: boolean

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
    hasTreeAnimated: boolean
    preserveOpacity?: boolean
}

export interface LayoutUpdateData {
    layout: Box
    snapshot: Measurements
    delta: Delta
    layoutDelta: Delta
    hasLayoutChanged: boolean
    hasRelativeLayoutChanged: boolean
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
    /**
     * Measure the space the instance is drawn in, for quad projection.
     * Renderers that can't leave this undefined, and only use boxes.
     */
    measureSpace?: (
        instance: I,
        parent: IProjectionNode | undefined,
        out: SpaceMeasurement,
        force: boolean
    ) => boolean
}

/**
 * Configuration for initial promotion of shared layout elements.
 * This was originally in React's SwitchLayoutGroupContext but is now
 * framework-agnostic to support vanilla JS usage.
 */
export interface InitialPromotionConfig {
    /**
     * The initial transition to use when the elements in this group mount (and automatically promoted).
     * Subsequent updates should provide a transition in the promote method.
     */
    transition?: Transition
    /**
     * If the follow tree should preserve its opacity when the lead is promoted on mount
     */
    shouldPreserveFollowOpacity?: (member: IProjectionNode) => boolean
}

export interface ProjectionNodeOptions {
    animate?: boolean
    layoutScroll?: boolean
    layoutRoot?: boolean
    alwaysMeasureLayout?: boolean
    onExitComplete?: VoidFunction
    animationType?: "size" | "position" | "both" | "preserve-aspect" | "x" | "y"
    layoutId?: string
    layout?: boolean | string
    visualElement?: VisualElement
    crossfade?: boolean
    transition?: Transition
    initialPromotionConfig?: InitialPromotionConfig
    layoutDependency?: unknown
    layoutAnchor?: Point | false
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"
