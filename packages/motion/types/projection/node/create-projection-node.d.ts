import { Process } from "framesync";
import { AnimationOptions, AnimationPlaybackControls } from "../../animation/animate";
import { ResolvedValues } from "../../render/types";
import { SubscriptionManager } from "../../utils/subscription-manager";
import { Axis, AxisDelta, Box, Delta, Point } from "../geometry/types";
import { NodeStack } from "../shared/stack";
import { IProjectionNode, Layout, LayoutEvents, ProjectionNodeConfig, ProjectionNodeOptions, Snapshot } from "./types";
import { FlatTree } from "../../render/utils/flat-tree";
import { Transition } from "../../types";
import { MotionStyle } from "../../motion/types";
/**
 * This should only ever be modified on the client otherwise it'll
 * persist through server requests. If we need instanced states we
 * could lazy-init via root.
 */
export declare const globalProjectionState: {
    /**
     * Global flag as to whether the tree has animated since the last time
     * we resized the window
     */
    hasAnimatedSinceResize: boolean;
    /**
     * We set this to true once, on the first update. Any nodes added to the tree beyond that
     * update will be given a `data-projection-id` attribute.
     */
    hasEverUpdated: boolean;
};
export declare function createProjectionNode<I>({ attachResizeListener, defaultParent, measureScroll, resetTransform, }: ProjectionNodeConfig<I>): {
    new (id: number | undefined, latestValues?: ResolvedValues, parent?: IProjectionNode | undefined): {
        /**
         * A unique ID generated for every projection node.
         *
         * The projection tree's `didUpdate` function will be triggered by the first element
         * in the tree to run its layout effects. However, if there are elements entering the tree
         * these might not be mounted yet. When React renders a `motion` component we
         * give it a unique selector and register it as a potential projection node (not all
         * rendered components will be committed by React). In `didUpdate`, we search the DOM for
         * these potential nodes with this id and hydrate the projetion node of the ones that were commited.
         */
        id: number | undefined;
        /**
         * A reference to the platform-native node (currently this will be a HTMLElement).
         */
        instance: I;
        /**
         * A reference to the root projection node. There'll only ever be one tree and one root.
         */
        root: IProjectionNode;
        /**
         * A reference to this node's parent.
         */
        parent?: IProjectionNode<unknown> | undefined;
        /**
         * A path from this node to the root node. This provides a fast way to iterate
         * back up the tree.
         */
        path: IProjectionNode[];
        /**
         * A Set containing all this component's children. This is used to iterate
         * through the children.
         *
         * TODO: This could be faster to iterate as a flat array stored on the root node.
         */
        children: Set<IProjectionNode<unknown>>;
        /**
         * Options for the node. We use this to configure what kind of layout animations
         * we should perform (if any).
         */
        options: ProjectionNodeOptions;
        /**
         * A snapshot of the element's state just before the current update. This is
         * hydrated when this node's `willUpdate` method is called and scrubbed at the
         * end of the tree's `didUpdate` method.
         */
        snapshot: Snapshot | undefined;
        /**
         * A box defining the element's layout relative to the page. This will have been
         * captured with all parent scrolls and projection transforms unset.
         */
        layout: Layout | undefined;
        /**
         * The layout used to calculate the previous layout animation. We use this to compare
         * layouts between renders and decide whether we need to trigger a new layout animation
         * or just let the current one play out.
         */
        targetLayout?: Box | undefined;
        /**
         * A mutable data structure we use to apply all parent transforms currently
         * acting on the element's layout. It's from here we can calculate the projectionDelta
         * required to get the element from its layout into its calculated target box.
         */
        layoutCorrected: Box;
        /**
         * An ideal projection transform we want to apply to the element. This is calculated,
         * usually when an element's layout has changed, and we want the element to look as though
         * its in its previous layout on the next frame. From there, we animated it down to 0
         * to animate the element to its new layout.
         */
        targetDelta?: Delta | undefined;
        /**
         * A mutable structure representing the visual bounding box on the page where we want
         * and element to appear. This can be set directly but is currently derived once a frame
         * from apply targetDelta to layout.
         */
        target?: Box | undefined;
        /**
         * A mutable structure describing a visual bounding box relative to the element's
         * projected parent. If defined, target will be derived from this rather than targetDelta.
         * If not defined, we'll attempt to calculate on the first layout animation frame
         * based on the targets calculated from targetDelta. This will transfer a layout animation
         * from viewport-relative to parent-relative.
         */
        relativeTarget?: Box | undefined;
        relativeTargetOrigin?: Box | undefined;
        relativeParent?: IProjectionNode<unknown> | undefined;
        /**
         * We use this to detect when its safe to shut down part of a projection tree.
         * We have to keep projecting children for scale correction and relative projection
         * until all their parents stop performing layout animations.
         */
        isTreeAnimating: boolean;
        isAnimationBlocked: boolean;
        /**
         * If true, attempt to resolve relativeTarget.
         */
        attemptToResolveRelativeTarget?: boolean | undefined;
        /**
         * A mutable structure that represents the target as transformed by the element's
         * latest user-set transforms (ie scale, x)
         */
        targetWithTransforms?: Box | undefined;
        /**
         * A calculated transform that will project an element from its layoutCorrected
         * into the target. This will be used by children to calculate their own layoutCorrect boxes.
         */
        projectionDelta?: Delta | undefined;
        /**
         * A calculated transform that will project an element from its layoutCorrected
         * into the targetWithTransforms.
         */
        projectionDeltaWithTransform?: Delta | undefined;
        /**
         * If we're tracking the scroll of this element, we store it here.
         */
        scroll?: Point | undefined;
        /**
         * Flag to true if we think this layout has been changed. We can't always know this,
         * currently we set it to true every time a component renders, or if it has a layoutDependency
         * if that has changed between renders. Additionally, components can be grouped by LayoutGroup
         * and if one node is dirtied, they all are.
         */
        isLayoutDirty: boolean;
        /**
         * Block layout updates for instant layout transitions throughout the tree.
         */
        updateManuallyBlocked: boolean;
        updateBlockedByResize: boolean;
        /**
         * Set to true between the start of the first `willUpdate` call and the end of the `didUpdate`
         * call.
         */
        isUpdating: boolean;
        /**
         * If this is an SVG element we currently disable projection transforms
         */
        isSVG: boolean;
        /**
         * Flag to true (during promotion) if a node doing an instant layout transition needs to reset
         * its projection styles.
         */
        needsReset: boolean;
        /**
         * Flags whether this node should have its transform reset prior to measuring.
         */
        shouldResetTransform: boolean;
        /**
         * An object representing the calculated contextual/accumulated/tree scale.
         * This will be used to scale calculcated projection transforms, as these are
         * calculated in screen-space but need to be scaled for elements to actually
         * make it to their calculated destinations.
         *
         * TODO: Lazy-init
         */
        treeScale: Point;
        /**
         * Is hydrated with a projection node if an element is animating from another.
         */
        resumeFrom?: IProjectionNode<unknown> | undefined;
        /**
         * Is hydrated with a projection node if an element is animating from another.
         */
        resumingFrom?: IProjectionNode<unknown> | undefined;
        /**
         * A reference to the element's latest animated values. This is a reference shared
         * between the element's VisualElement and the ProjectionNode.
         */
        latestValues: ResolvedValues;
        /**
         *
         */
        eventHandlers: Map<LayoutEvents, SubscriptionManager<any>>;
        nodes?: FlatTree | undefined;
        depth: number;
        /**
         * When we update the projection transform, we also build it into a string.
         * If the string changes between frames, we trigger a render.
         */
        projectionTransform: string;
        /**
         * If transformTemplate generates a different value before/after the
         * update, we need to reset the transform.
         */
        prevTransformTemplateValue: string | undefined;
        preserveOpacity?: boolean | undefined;
        addEventListener(name: LayoutEvents, handler: any): () => void;
        notifyListeners(name: LayoutEvents, ...args: any): void;
        hasListeners(name: LayoutEvents): boolean;
        potentialNodes: Map<number, IProjectionNode<unknown>>;
        registerPotentialNode(id: number, node: IProjectionNode): void;
        /**
         * Lifecycles
         */
        mount(instance: I, isLayoutDirty?: boolean): void;
        unmount(): void;
        blockUpdate(): void;
        unblockUpdate(): void;
        isUpdateBlocked(): boolean;
        isTreeAnimationBlocked(): boolean;
        startUpdate(): void;
        willUpdate(shouldNotifyListeners?: boolean): void;
        didUpdate(): void;
        clearAllSnapshots(): void;
        scheduleUpdateProjection(): void;
        scheduleCheckAfterUnmount(): void;
        checkUpdateFailed: () => void;
        updateProjection: () => void;
        /**
         * Update measurements
         */
        updateSnapshot(): void;
        updateLayout(): void;
        updateScroll(): void;
        resetTransform(): void;
        measure(): Box;
        removeElementScroll(box: Box): Box;
        applyTransform(box: Box, transformOnly?: boolean): Box;
        removeTransform(box: Box): Box;
        /**
         *
         */
        setTargetDelta(delta: Delta): void;
        setOptions(options: ProjectionNodeOptions): void;
        clearMeasurements(): void;
        /**
         * Frame calculations
         */
        resolveTargetDelta(): void;
        getClosestProjectingParent(): IProjectionNode<unknown> | undefined;
        hasProjected: boolean;
        calcProjection(): void;
        isVisible: boolean;
        hide(): void;
        show(): void;
        scheduleRender(notifyAll?: boolean): void;
        /**
         * Animation
         */
        animationProgress: number;
        animationValues?: ResolvedValues | undefined;
        pendingAnimation?: Process | undefined;
        currentAnimation?: AnimationPlaybackControls | undefined;
        mixTargetDelta: (progress: number) => void;
        setAnimationOrigin(delta: Delta, hasOnlyRelativeTargetChanged?: boolean): void;
        startAnimation(options: AnimationOptions<number>): void;
        completeAnimation(): void;
        finishAnimation(): void;
        applyTransformsToTarget(): void;
        /**
         * Shared layout
         */
        sharedNodes: Map<string, NodeStack>;
        registerSharedNode(layoutId: string, node: IProjectionNode): void;
        isLead(): boolean;
        getLead(): IProjectionNode<unknown> | any;
        getPrevLead(): IProjectionNode<unknown> | undefined;
        getStack(): NodeStack | undefined;
        promote({ needsReset, transition, preserveFollowOpacity, }?: {
            needsReset?: boolean | undefined;
            transition?: Transition | undefined;
            preserveFollowOpacity?: boolean | undefined;
        }): void;
        relegate(): boolean;
        resetRotation(): void;
        getProjectionStyles(styleProp?: MotionStyle): ResolvedValues;
        clearSnapshot(): void;
        resetTree(): void;
    };
};
export declare function mixAxisDelta(output: AxisDelta, delta: AxisDelta, p: number): void;
export declare function mixAxis(output: Axis, from: Axis, to: Axis, p: number): void;
export declare function mixBox(output: Box, from: Box, to: Box, p: number): void;
