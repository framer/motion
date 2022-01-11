import { Transition } from "../../types";
import { ResolvedValues, VisualElement } from "../../render/types";
import { Box, Delta, Point } from "../geometry/types";
import { NodeStack } from "../shared/stack";
import { AnimationPlaybackControls } from "../../animation/animate";
import { FlatTree } from "../../render/utils/flat-tree";
import { InitialPromotionConfig } from "../../context/SwitchLayoutGroupContext";
import { MotionStyle } from "../../motion/types";
export interface Snapshot {
    measured: Box;
    layout: Box;
    latestValues: ResolvedValues;
    isShared?: boolean;
}
export interface Layout {
    measured: Box;
    actual: Box;
}
export declare type LayoutEvents = "willUpdate" | "didUpdate" | "measure" | "projectionUpdate" | "animationComplete";
export interface IProjectionNode<I = unknown> {
    id: number | undefined;
    parent?: IProjectionNode;
    relativeParent?: IProjectionNode;
    root?: IProjectionNode;
    children: Set<IProjectionNode>;
    path: IProjectionNode[];
    nodes?: FlatTree;
    depth: number;
    instance: I;
    mount: (node: I, isLayoutDirty?: boolean) => void;
    unmount: () => void;
    options: ProjectionNodeOptions;
    setOptions(options: ProjectionNodeOptions): void;
    layout?: Layout;
    snapshot?: Snapshot;
    target?: Box;
    relativeTarget?: Box;
    targetDelta?: Delta;
    targetWithTransforms?: Box;
    scroll?: Point;
    treeScale?: Point;
    projectionDelta?: Delta;
    latestValues: ResolvedValues;
    isLayoutDirty: boolean;
    shouldResetTransform: boolean;
    prevTransformTemplateValue: string | undefined;
    isUpdateBlocked(): boolean;
    updateManuallyBlocked: boolean;
    updateBlockedByResize: boolean;
    blockUpdate(): void;
    unblockUpdate(): void;
    isUpdating: boolean;
    needsReset: boolean;
    startUpdate(): void;
    willUpdate(notifyListeners?: boolean): void;
    didUpdate(): void;
    measure(): Box;
    updateLayout(): void;
    updateSnapshot(): void;
    clearSnapshot(): void;
    updateScroll(): void;
    scheduleUpdateProjection(): void;
    scheduleCheckAfterUnmount(): void;
    checkUpdateFailed(): void;
    potentialNodes: Map<number, IProjectionNode>;
    sharedNodes: Map<string, NodeStack>;
    registerPotentialNode(id: number, node: IProjectionNode): void;
    registerSharedNode(id: string, node: IProjectionNode): void;
    getStack(): NodeStack | undefined;
    isVisible: boolean;
    hide(): void;
    show(): void;
    scheduleRender(notifyAll?: boolean): void;
    getClosestProjectingParent(): IProjectionNode | undefined;
    setTargetDelta(delta: Delta): void;
    resetTransform(): void;
    resetRotation(): void;
    applyTransform(box: Box, transformOnly?: boolean): Box;
    resolveTargetDelta(): void;
    calcProjection(): void;
    getProjectionStyles(styles?: MotionStyle): MotionStyle | undefined;
    clearMeasurements(): void;
    resetTree(): void;
    animationValues?: ResolvedValues;
    currentAnimation?: AnimationPlaybackControls;
    isTreeAnimating?: boolean;
    isAnimationBlocked?: boolean;
    isTreeAnimationBlocked: () => boolean;
    setAnimationOrigin(delta: Delta): void;
    startAnimation(transition: Transition): void;
    finishAnimation(): void;
    isLead(): boolean;
    promote(options?: {
        needsReset?: boolean;
        transition?: Transition;
        preserveFollowOpacity?: boolean;
    }): void;
    relegate(): boolean;
    resumeFrom?: IProjectionNode;
    resumingFrom?: IProjectionNode;
    isPresent?: boolean;
    addEventListener(name: LayoutEvents, handler: any): VoidFunction;
    notifyListeners(name: LayoutEvents, ...args: any): void;
    hasListeners(name: LayoutEvents): boolean;
    preserveOpacity?: boolean;
}
export interface LayoutUpdateData {
    layout: Box;
    snapshot: Snapshot;
    delta: Delta;
    layoutDelta: Delta;
    hasLayoutChanged: boolean;
    hasRelativeTargetChanged: boolean;
}
export declare type LayoutUpdateHandler = (data: LayoutUpdateData) => void;
export interface ProjectionNodeConfig<I> {
    defaultParent?: () => IProjectionNode;
    attachResizeListener?: (instance: I, notifyResize: VoidFunction) => VoidFunction;
    measureScroll: (instance: I) => Point;
    resetTransform?: (instance: I, value?: string) => void;
}
export interface ProjectionNodeOptions {
    animate?: boolean;
    layoutScroll?: boolean;
    alwaysMeasureLayout?: boolean;
    scheduleRender?: VoidFunction;
    onExitComplete?: VoidFunction;
    animationType?: "size" | "position" | "both";
    layoutId?: string;
    layout?: boolean | string;
    visualElement?: VisualElement;
    crossfade?: boolean;
    transition?: Transition;
    initialPromotionConfig?: InitialPromotionConfig;
}
export declare type ProjectionEventName = "layoutUpdate" | "projectionUpdate";
