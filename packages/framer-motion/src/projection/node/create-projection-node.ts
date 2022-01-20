import sync, { cancelSync, flushSync, Process } from "framesync"
import { mix } from "popmotion"
import {
    animate,
    AnimationOptions,
    AnimationPlaybackControls,
} from "../../animation/animate"
import { ResolvedValues } from "../../render/types"
import { SubscriptionManager } from "../../utils/subscription-manager"
import { mixValues } from "../animation/mix-values"
import { copyBoxInto } from "../geometry/copy"
import { applyBoxDelta, applyTreeDeltas } from "../geometry/delta-apply"
import {
    calcBoxDelta,
    calcLength,
    calcRelativeBox,
    calcRelativePosition,
} from "../geometry/delta-calc"
import { removeBoxTransforms } from "../geometry/delta-remove"
import { createBox, createDelta } from "../geometry/models"
import { transformBox, translateAxis } from "../geometry/delta-apply"
import { Axis, AxisDelta, Box, Delta, Point } from "../geometry/types"
import { getValueTransition } from "../../animation/utils/transitions"
import { boxEquals, isDeltaZero } from "../geometry/utils"
import { NodeStack } from "../shared/stack"
import { scaleCorrectors } from "../styles/scale-correction"
import { buildProjectionTransform } from "../styles/transform"
import { eachAxis } from "../utils/each-axis"
import { hasScale, hasTransform } from "../utils/has-transform"
import {
    IProjectionNode,
    Layout,
    LayoutEvents,
    LayoutUpdateData,
    ProjectionNodeConfig,
    ProjectionNodeOptions,
    Snapshot,
} from "./types"
import { transformAxes } from "../../render/html/utils/transform"
import { FlatTree } from "../../render/utils/flat-tree"
import { Transition } from "../../types"
import { resolveMotionValue } from "../../value/utils/resolve-motion-value"
import { MotionStyle } from "../../motion/types"

/**
 * We use 1000 as the animation target as 0-1000 maps better to pixels than 0-1
 * which has a noticeable difference in spring animations
 */
const animationTarget = 1000

/**
 * This should only ever be modified on the client otherwise it'll
 * persist through server requests. If we need instanced states we
 * could lazy-init via root.
 */
export const globalProjectionState = {
    /**
     * Global flag as to whether the tree has animated since the last time
     * we resized the window
     */
    hasAnimatedSinceResize: true,

    /**
     * We set this to true once, on the first update. Any nodes added to the tree beyond that
     * update will be given a `data-projection-id` attribute.
     */
    hasEverUpdated: false,
}

export function createProjectionNode<I>({
    attachResizeListener,
    defaultParent,
    measureScroll,
    resetTransform,
}: ProjectionNodeConfig<I>) {
    return class ProjectionNode implements IProjectionNode<I> {
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
        id: number | undefined

        /**
         * A reference to the platform-native node (currently this will be a HTMLElement).
         */
        instance: I

        /**
         * A reference to the root projection node. There'll only ever be one tree and one root.
         */
        root: IProjectionNode

        /**
         * A reference to this node's parent.
         */
        parent?: IProjectionNode

        /**
         * A path from this node to the root node. This provides a fast way to iterate
         * back up the tree.
         */
        path: IProjectionNode[]

        /**
         * A Set containing all this component's children. This is used to iterate
         * through the children.
         *
         * TODO: This could be faster to iterate as a flat array stored on the root node.
         */
        children = new Set<IProjectionNode>()

        /**
         * Options for the node. We use this to configure what kind of layout animations
         * we should perform (if any).
         */
        options: ProjectionNodeOptions = {}

        /**
         * A snapshot of the element's state just before the current update. This is
         * hydrated when this node's `willUpdate` method is called and scrubbed at the
         * end of the tree's `didUpdate` method.
         */
        snapshot: Snapshot | undefined

        /**
         * A box defining the element's layout relative to the page. This will have been
         * captured with all parent scrolls and projection transforms unset.
         */
        layout: Layout | undefined

        /**
         * The layout used to calculate the previous layout animation. We use this to compare
         * layouts between renders and decide whether we need to trigger a new layout animation
         * or just let the current one play out.
         */
        targetLayout?: Box

        /**
         * A mutable data structure we use to apply all parent transforms currently
         * acting on the element's layout. It's from here we can calculate the projectionDelta
         * required to get the element from its layout into its calculated target box.
         */
        layoutCorrected: Box

        /**
         * An ideal projection transform we want to apply to the element. This is calculated,
         * usually when an element's layout has changed, and we want the element to look as though
         * its in its previous layout on the next frame. From there, we animated it down to 0
         * to animate the element to its new layout.
         */
        targetDelta?: Delta

        /**
         * A mutable structure representing the visual bounding box on the page where we want
         * and element to appear. This can be set directly but is currently derived once a frame
         * from apply targetDelta to layout.
         */
        target?: Box

        /**
         * A mutable structure describing a visual bounding box relative to the element's
         * projected parent. If defined, target will be derived from this rather than targetDelta.
         * If not defined, we'll attempt to calculate on the first layout animation frame
         * based on the targets calculated from targetDelta. This will transfer a layout animation
         * from viewport-relative to parent-relative.
         */
        relativeTarget?: Box

        relativeTargetOrigin?: Box
        relativeParent?: IProjectionNode

        /**
         * We use this to detect when its safe to shut down part of a projection tree.
         * We have to keep projecting children for scale correction and relative projection
         * until all their parents stop performing layout animations.
         */
        isTreeAnimating = false

        isAnimationBlocked = false

        /**
         * If true, attempt to resolve relativeTarget.
         */
        attemptToResolveRelativeTarget?: boolean

        /**
         * A mutable structure that represents the target as transformed by the element's
         * latest user-set transforms (ie scale, x)
         */
        targetWithTransforms?: Box

        /**
         * A calculated transform that will project an element from its layoutCorrected
         * into the target. This will be used by children to calculate their own layoutCorrect boxes.
         */
        projectionDelta?: Delta

        /**
         * A calculated transform that will project an element from its layoutCorrected
         * into the targetWithTransforms.
         */
        projectionDeltaWithTransform?: Delta

        /**
         * If we're tracking the scroll of this element, we store it here.
         */
        scroll?: Point

        /**
         * Flag to true if we think this layout has been changed. We can't always know this,
         * currently we set it to true every time a component renders, or if it has a layoutDependency
         * if that has changed between renders. Additionally, components can be grouped by LayoutGroup
         * and if one node is dirtied, they all are.
         */
        isLayoutDirty = false

        /**
         * Block layout updates for instant layout transitions throughout the tree.
         */
        updateManuallyBlocked = false

        updateBlockedByResize = false

        /**
         * Set to true between the start of the first `willUpdate` call and the end of the `didUpdate`
         * call.
         */
        isUpdating = false

        /**
         * If this is an SVG element we currently disable projection transforms
         */
        isSVG = false

        /**
         * Flag to true (during promotion) if a node doing an instant layout transition needs to reset
         * its projection styles.
         */
        needsReset = false

        /**
         * Flags whether this node should have its transform reset prior to measuring.
         */
        shouldResetTransform = false

        /**
         * An object representing the calculated contextual/accumulated/tree scale.
         * This will be used to scale calculcated projection transforms, as these are
         * calculated in screen-space but need to be scaled for elements to actually
         * make it to their calculated destinations.
         *
         * TODO: Lazy-init
         */
        treeScale: Point = { x: 1, y: 1 }

        /**
         * Is hydrated with a projection node if an element is animating from another.
         */
        resumeFrom?: IProjectionNode

        /**
         * Is hydrated with a projection node if an element is animating from another.
         */
        resumingFrom?: IProjectionNode

        /**
         * A reference to the element's latest animated values. This is a reference shared
         * between the element's VisualElement and the ProjectionNode.
         */
        latestValues: ResolvedValues

        /**
         *
         */
        eventHandlers = new Map<LayoutEvents, SubscriptionManager<any>>()

        nodes?: FlatTree

        depth: number

        /**
         * When we update the projection transform, we also build it into a string.
         * If the string changes between frames, we trigger a render.
         */
        projectionTransform: string

        /**
         * If transformTemplate generates a different value before/after the
         * update, we need to reset the transform.
         */
        prevTransformTemplateValue: string | undefined

        preserveOpacity?: boolean

        constructor(
            id: number | undefined,
            latestValues: ResolvedValues = {},
            parent: IProjectionNode | undefined = defaultParent?.()
        ) {
            this.id = id
            this.latestValues = latestValues
            this.root = parent ? parent.root || parent : this
            this.path = parent ? [...parent.path, parent] : []
            this.parent = parent

            this.depth = parent ? parent.depth + 1 : 0

            id && this.root.registerPotentialNode(id, this)

            for (let i = 0; i < this.path.length; i++) {
                this.path[i].shouldResetTransform = true
            }

            if (this.root === this) this.nodes = new FlatTree()
        }

        addEventListener(name: LayoutEvents, handler: any) {
            if (!this.eventHandlers.has(name)) {
                this.eventHandlers.set(name, new SubscriptionManager())
            }

            return this.eventHandlers.get(name)!.add(handler)
        }

        notifyListeners(name: LayoutEvents, ...args: any) {
            const subscriptionManager = this.eventHandlers.get(name)
            subscriptionManager?.notify(...args)
        }

        hasListeners(name: LayoutEvents) {
            return this.eventHandlers.has(name)
        }

        // Note: Currently only running on root node
        potentialNodes = new Map<number, IProjectionNode>()
        registerPotentialNode(id: number, node: IProjectionNode) {
            this.potentialNodes.set(id, node)
        }

        /**
         * Lifecycles
         */
        mount(instance: I, isLayoutDirty = false) {
            if (this.instance) return

            this.isSVG =
                instance instanceof SVGElement && instance.tagName !== "svg"

            this.instance = instance

            const { layoutId, layout, visualElement } = this.options
            if (visualElement && !visualElement.getInstance()) {
                visualElement.mount(instance)
            }

            this.root.nodes!.add(this)
            this.parent?.children.add(this)
            this.id && this.root.potentialNodes.delete(this.id)

            if (isLayoutDirty && (layout || layoutId)) {
                this.isLayoutDirty = true
            }

            if (attachResizeListener) {
                let unblockTimeout: number

                const resizeUnblockUpdate = () =>
                    (this.root.updateBlockedByResize = false)

                attachResizeListener(instance, () => {
                    this.root.updateBlockedByResize = true

                    clearTimeout(unblockTimeout)
                    unblockTimeout = window.setTimeout(resizeUnblockUpdate, 250)

                    if (globalProjectionState.hasAnimatedSinceResize) {
                        globalProjectionState.hasAnimatedSinceResize = false
                        this.nodes!.forEach(finishAnimation)
                    }
                })
            }

            if (layoutId) {
                this.root.registerSharedNode(layoutId, this)
            }

            // Only register the handler if it requires layout animation
            if (
                this.options.animate !== false &&
                visualElement &&
                (layoutId || layout)
            ) {
                this.addEventListener(
                    "didUpdate",
                    ({
                        delta,
                        hasLayoutChanged,
                        hasRelativeTargetChanged,
                        layout: newLayout,
                    }: LayoutUpdateData) => {
                        if (this.isTreeAnimationBlocked()) {
                            this.target = undefined
                            this.relativeTarget = undefined
                            return
                        }

                        // TODO: Check here if an animation exists
                        const layoutTransition =
                            this.options.transition ??
                            visualElement.getDefaultTransition() ??
                            defaultLayoutTransition

                        const { onLayoutAnimationComplete } =
                            visualElement.getProps()

                        /**
                         * The target layout of the element might stay the same,
                         * but its position relative to its parent has changed.
                         */
                        const targetChanged =
                            !this.targetLayout ||
                            !boxEquals(this.targetLayout, newLayout) ||
                            hasRelativeTargetChanged

                        /**
                         * If the layout hasn't seemed to have changed, it might be that the
                         * element is visually in the same place in the document but its position
                         * relative to its parent has indeed changed. So here we check for that.
                         */
                        const hasOnlyRelativeTargetChanged =
                            !hasLayoutChanged && hasRelativeTargetChanged

                        if (
                            this.resumeFrom?.instance ||
                            hasOnlyRelativeTargetChanged ||
                            (hasLayoutChanged &&
                                (targetChanged || !this.currentAnimation))
                        ) {
                            if (this.resumeFrom) {
                                this.resumingFrom = this.resumeFrom
                                this.resumingFrom.resumingFrom = undefined
                            }

                            this.setAnimationOrigin(
                                delta,
                                hasOnlyRelativeTargetChanged
                            )

                            const animationOptions = {
                                ...getValueTransition(
                                    layoutTransition,
                                    "layout"
                                ),
                                onComplete: onLayoutAnimationComplete,
                            }

                            if (visualElement.shouldReduceMotion) {
                                animationOptions.type = false
                            }

                            this.startAnimation(animationOptions)
                        } else {
                            this.isLead() && this.options.onExitComplete?.()
                        }

                        this.targetLayout = newLayout
                    }
                )
            }
        }

        unmount() {
            this.options.layoutId && this.willUpdate()
            this.root.nodes!.remove(this)
            this.getStack()?.remove(this)
            this.parent?.children.delete(this)
            ;(this.instance as any) = undefined

            cancelSync.preRender(this.updateProjection)
        }

        // only on the root
        blockUpdate() {
            this.updateManuallyBlocked = true
        }

        unblockUpdate() {
            this.updateManuallyBlocked = false
        }

        isUpdateBlocked() {
            return this.updateManuallyBlocked || this.updateBlockedByResize
        }

        isTreeAnimationBlocked() {
            return (
                this.isAnimationBlocked ||
                this.parent?.isTreeAnimationBlocked() ||
                false
            )
        }

        // Note: currently only running on root node
        startUpdate() {
            if (this.isUpdateBlocked()) return
            this.isUpdating = true
            this.nodes?.forEach(resetRotation)
        }

        willUpdate(shouldNotifyListeners = true) {
            if (this.root.isUpdateBlocked()) {
                this.options.onExitComplete?.()
                return
            }
            !this.root.isUpdating && this.root.startUpdate()
            if (this.isLayoutDirty) return

            this.isLayoutDirty = true
            for (let i = 0; i < this.path.length; i++) {
                const node = this.path[i]
                node.shouldResetTransform = true
                /**
                 * TODO: Check we haven't updated the scroll
                 * since the last didUpdate
                 */
                node.updateScroll()
            }

            const { layoutId, layout } = this.options
            if (layoutId === undefined && !layout) return

            const transformTemplate =
                this.options.visualElement?.getProps().transformTemplate
            this.prevTransformTemplateValue = transformTemplate?.(
                this.latestValues,
                ""
            )

            this.updateSnapshot()
            shouldNotifyListeners && this.notifyListeners("willUpdate")
        }

        // Note: Currently only running on root node
        didUpdate() {
            const updateWasBlocked = this.isUpdateBlocked()

            // When doing an instant transition, we skip the layout update,
            // but should still clean up the measurements so that the next
            // snapshot could be taken correctly.
            if (updateWasBlocked) {
                this.unblockUpdate()
                this.clearAllSnapshots()
                this.nodes!.forEach(clearMeasurements)
                return
            }
            if (!this.isUpdating) return

            this.isUpdating = false

            /**
             * Search for and mount newly-added projection elements.
             *
             * TODO: Every time a new component is rendered we could search up the tree for
             * the closest mounted node and query from there rather than document.
             */
            if (this.potentialNodes.size) {
                this.potentialNodes.forEach(mountNodeEarly)
                this.potentialNodes.clear()
            }

            /**
             * Write
             */
            this.nodes!.forEach(resetTransformStyle)

            /**
             * Read ==================
             */
            // Update layout measurements of updated children
            this.nodes!.forEach(updateLayout)

            /**
             * Write
             */
            // Notify listeners that the layout is updated
            this.nodes!.forEach(notifyLayoutUpdate)
            this.clearAllSnapshots()

            // Flush any scheduled updates
            flushSync.update()
            flushSync.preRender()
            flushSync.render()
        }

        clearAllSnapshots() {
            this.nodes!.forEach(clearSnapshot)
            this.sharedNodes.forEach(removeLeadSnapshots)
        }

        scheduleUpdateProjection() {
            sync.preRender(this.updateProjection, false, true)
        }

        scheduleCheckAfterUnmount() {
            /**
             * If the unmounting node is in a layoutGroup and did trigger a willUpdate,
             * we manually call didUpdate to give a chance to the siblings to animate.
             * Otherwise, cleanup all snapshots to prevents future nodes from reusing them.
             */
            sync.postRender(() => {
                if (this.isLayoutDirty) {
                    this.root.didUpdate()
                } else {
                    this.root.checkUpdateFailed()
                }
            })
        }

        checkUpdateFailed = () => {
            if (this.isUpdating) {
                this.isUpdating = false
                this.clearAllSnapshots()
            }
        }

        updateProjection = () => {
            this.nodes!.forEach(resolveTargetDelta)
            this.nodes!.forEach(calcProjection)
        }

        /**
         * Update measurements
         */
        updateSnapshot() {
            if (this.snapshot || !this.instance) return
            const measured = this.measure()!
            const layout = this.removeTransform(
                this.removeElementScroll(measured)
            )
            roundBox(layout)

            this.snapshot = {
                measured,
                layout,
                latestValues: {},
            }
        }

        updateLayout() {
            if (!this.instance) return

            // TODO: Incorporate into a forwarded scroll offset
            this.updateScroll()

            if (
                !(this.options.alwaysMeasureLayout && this.isLead()) &&
                !this.isLayoutDirty
            ) {
                return
            }

            /**
             * When a node is mounted, it simply resumes from the prevLead's
             * snapshot instead of taking a new one, but the ancestors scroll
             * might have updated while the prevLead is unmounted. We need to
             * update the scroll again to make sure the layout we measure is
             * up to date.
             */
            if (this.resumeFrom && !this.resumeFrom.instance) {
                for (let i = 0; i < this.path.length; i++) {
                    const node = this.path[i]
                    node.updateScroll()
                }
            }

            const measured = this.measure()
            roundBox(measured)

            const prevLayout = this.layout
            this.layout = {
                measured,
                actual: this.removeElementScroll(measured),
            }

            this.layoutCorrected = createBox()
            this.isLayoutDirty = false
            this.projectionDelta = undefined
            this.notifyListeners("measure", this.layout.actual)

            this.options.visualElement?.notifyLayoutMeasure(
                this.layout.actual,
                prevLayout?.actual
            )
        }

        updateScroll() {
            if (this.options.layoutScroll && this.instance) {
                this.scroll = measureScroll(this.instance)
            }
        }

        resetTransform() {
            if (!resetTransform) return
            const isResetRequested =
                this.isLayoutDirty || this.shouldResetTransform

            const hasProjection =
                this.projectionDelta && !isDeltaZero(this.projectionDelta)

            const transformTemplate =
                this.options.visualElement?.getProps().transformTemplate
            const transformTemplateValue = transformTemplate?.(
                this.latestValues,
                ""
            )
            const transformTemplateHasChanged =
                transformTemplateValue !== this.prevTransformTemplateValue
            if (
                isResetRequested &&
                (hasProjection ||
                    hasTransform(this.latestValues) ||
                    transformTemplateHasChanged)
            ) {
                resetTransform(this.instance, transformTemplateValue)
                this.shouldResetTransform = false
                this.scheduleRender()
            }
        }

        measure() {
            const { visualElement } = this.options
            if (!visualElement) return createBox()

            const box = visualElement.measureViewportBox()

            // Remove viewport scroll to give page-relative coordinates
            const { scroll } = this.root
            if (scroll) {
                translateAxis(box.x, scroll.x)
                translateAxis(box.y, scroll.y)
            }

            return box
        }

        removeElementScroll(box: Box): Box {
            const boxWithoutScroll = createBox()
            copyBoxInto(boxWithoutScroll, box)

            /**
             * Performance TODO: Keep a cumulative scroll offset down the tree
             * rather than loop back up the path.
             */
            for (let i = 0; i < this.path.length; i++) {
                const node = this.path[i]
                const { scroll, options } = node

                if (node !== this.root && scroll && options.layoutScroll) {
                    translateAxis(boxWithoutScroll.x, scroll.x)
                    translateAxis(boxWithoutScroll.y, scroll.y)
                }
            }

            return boxWithoutScroll
        }

        applyTransform(box: Box, transformOnly = false): Box {
            const withTransforms = createBox()
            copyBoxInto(withTransforms, box)
            for (let i = 0; i < this.path.length; i++) {
                const node = this.path[i]

                if (
                    !transformOnly &&
                    node.options.layoutScroll &&
                    node.scroll &&
                    node !== node.root
                ) {
                    transformBox(withTransforms, {
                        x: -node.scroll.x,
                        y: -node.scroll.y,
                    })
                }

                if (!hasTransform(node.latestValues)) continue
                transformBox(withTransforms, node.latestValues)
            }

            if (hasTransform(this.latestValues)) {
                transformBox(withTransforms, this.latestValues)
            }

            return withTransforms
        }

        removeTransform(box: Box): Box {
            const boxWithoutTransform = createBox()
            copyBoxInto(boxWithoutTransform, box)

            for (let i = 0; i < this.path.length; i++) {
                const node = this.path[i]
                if (!node.instance) continue
                if (!hasTransform(node.latestValues)) continue

                hasScale(node.latestValues) && node.updateSnapshot()

                const sourceBox = createBox()
                const nodeBox = node.measure()
                copyBoxInto(sourceBox, nodeBox)

                removeBoxTransforms(
                    boxWithoutTransform,
                    node.latestValues,
                    node.snapshot?.layout,
                    sourceBox
                )
            }

            if (hasTransform(this.latestValues)) {
                removeBoxTransforms(boxWithoutTransform, this.latestValues)
            }

            return boxWithoutTransform
        }

        /**
         *
         */
        setTargetDelta(delta: Delta) {
            this.targetDelta = delta
            this.root.scheduleUpdateProjection()
        }

        setOptions(options: ProjectionNodeOptions) {
            this.options = {
                ...this.options,
                ...options,
                crossfade: options.crossfade ?? true,
            }
        }

        clearMeasurements() {
            this.scroll = undefined
            this.layout = undefined
            this.snapshot = undefined
            this.prevTransformTemplateValue = undefined
            this.targetDelta = undefined
            this.target = undefined
            this.isLayoutDirty = false
        }

        /**
         * Frame calculations
         */
        resolveTargetDelta() {
            const { layout, layoutId } = this.options

            /**
             * If we have no layout, we can't perform projection, so early return
             */
            if (!this.layout || !(layout || layoutId)) return

            /**
             * If we don't have a targetDelta but do have a layout, we can attempt to resolve
             * a relativeParent. This will allow a component to perform scale correction
             * even if no animation has started.
             */
            // TODO If this is unsuccessful this currently happens every frame
            if (!this.targetDelta && !this.relativeTarget) {
                // TODO: This is a semi-repetition of further down this function, make DRY
                this.relativeParent = this.getClosestProjectingParent()
                if (this.relativeParent && this.relativeParent.layout) {
                    this.relativeTarget = createBox()
                    this.relativeTargetOrigin = createBox()
                    calcRelativePosition(
                        this.relativeTargetOrigin,
                        this.layout.actual,
                        this.relativeParent.layout.actual
                    )
                    copyBoxInto(this.relativeTarget, this.relativeTargetOrigin)
                }
            }

            /**
             * If we have no relative target or no target delta our target isn't valid
             * for this frame.
             */
            if (!this.relativeTarget && !this.targetDelta) return

            /**
             * Lazy-init target data structure
             */
            if (!this.target) {
                this.target = createBox()
                this.targetWithTransforms = createBox()
            }

            /**
             * If we've got a relative box for this component, resolve it into a target relative to the parent.
             */
            if (
                this.relativeTarget &&
                this.relativeTargetOrigin &&
                this.relativeParent?.target
            ) {
                calcRelativeBox(
                    this.target,
                    this.relativeTarget,
                    this.relativeParent.target
                )

                /**
                 * If we've only got a targetDelta, resolve it into a target
                 */
            } else if (this.targetDelta) {
                if (Boolean(this.resumingFrom)) {
                    // TODO: This is creating a new object every frame
                    this.target = this.applyTransform(this.layout.actual)
                } else {
                    copyBoxInto(this.target, this.layout.actual)
                }

                applyBoxDelta(this.target, this.targetDelta)
            } else {
                /**
                 * If no target, use own layout as target
                 */
                copyBoxInto(this.target, this.layout.actual)
            }

            /**
             * If we've been told to attempt to resolve a relative target, do so.
             */

            if (this.attemptToResolveRelativeTarget) {
                this.attemptToResolveRelativeTarget = false
                this.relativeParent = this.getClosestProjectingParent()

                if (
                    this.relativeParent &&
                    Boolean(this.relativeParent.resumingFrom) ===
                        Boolean(this.resumingFrom) &&
                    !this.relativeParent.options.layoutScroll &&
                    this.relativeParent.target
                ) {
                    this.relativeTarget = createBox()
                    this.relativeTargetOrigin = createBox()

                    calcRelativePosition(
                        this.relativeTargetOrigin,
                        this.target,
                        this.relativeParent.target
                    )
                    copyBoxInto(this.relativeTarget, this.relativeTargetOrigin)
                }
            }
        }

        getClosestProjectingParent() {
            if (!this.parent || hasTransform(this.parent.latestValues))
                return undefined

            if (
                (this.parent.relativeTarget || this.parent.targetDelta) &&
                this.parent.layout
            ) {
                return this.parent
            } else {
                return this.parent.getClosestProjectingParent()
            }
        }

        hasProjected: boolean = false

        calcProjection() {
            const { layout, layoutId } = this.options

            /**
             * If this section of the tree isn't animating we can
             * delete our target sources for the following frame.
             */
            this.isTreeAnimating = Boolean(
                this.parent?.isTreeAnimating ||
                    this.currentAnimation ||
                    this.pendingAnimation
            )
            if (!this.isTreeAnimating) {
                this.targetDelta = this.relativeTarget = undefined
            }

            if (!this.layout || !(layout || layoutId)) return

            const lead = this.getLead()
            /**
             * Reset the corrected box with the latest values from box, as we're then going
             * to perform mutative operations on it.
             */
            copyBoxInto(this.layoutCorrected, this.layout.actual)

            /**
             * Apply all the parent deltas to this box to produce the corrected box. This
             * is the layout box, as it will appear on screen as a result of the transforms of its parents.
             */
            applyTreeDeltas(
                this.layoutCorrected,
                this.treeScale,
                this.path,
                Boolean(this.resumingFrom) || this !== lead
            )

            const { target } = lead
            if (!target) return

            if (!this.projectionDelta) {
                this.projectionDelta = createDelta()
                this.projectionDeltaWithTransform = createDelta()
            }

            const prevTreeScaleX = this.treeScale.x
            const prevTreeScaleY = this.treeScale.y
            const prevProjectionTransform = this.projectionTransform

            /**
             * Update the delta between the corrected box and the target box before user-set transforms were applied.
             * This will allow us to calculate the corrected borderRadius and boxShadow to compensate
             * for our layout reprojection, but still allow them to be scaled correctly by the user.
             * It might be that to simplify this we may want to accept that user-set scale is also corrected
             * and we wouldn't have to keep and calc both deltas, OR we could support a user setting
             * to allow people to choose whether these styles are corrected based on just the
             * layout reprojection or the final bounding box.
             */
            calcBoxDelta(
                this.projectionDelta,
                this.layoutCorrected,
                target,
                this.latestValues
            )

            this.projectionTransform = buildProjectionTransform(
                this.projectionDelta!,
                this.treeScale
            )

            if (
                this.projectionTransform !== prevProjectionTransform ||
                this.treeScale.x !== prevTreeScaleX ||
                this.treeScale.y !== prevTreeScaleY
            ) {
                this.hasProjected = true
                this.scheduleRender()

                this.notifyListeners("projectionUpdate", target)
            }
        }

        isVisible = true
        hide() {
            this.isVisible = false
            // TODO: Schedule render
        }
        show() {
            this.isVisible = true
            // TODO: Schedule render
        }

        scheduleRender(notifyAll = true) {
            this.options.scheduleRender?.()
            notifyAll && this.getStack()?.scheduleRender()
            if (this.resumingFrom && !this.resumingFrom.instance) {
                this.resumingFrom = undefined
            }
        }

        /**
         * Animation
         */
        animationProgress = 0
        animationValues?: ResolvedValues
        pendingAnimation?: Process
        currentAnimation?: AnimationPlaybackControls
        mixTargetDelta: (progress: number) => void

        setAnimationOrigin(
            delta: Delta,
            hasOnlyRelativeTargetChanged: boolean = false
        ) {
            const snapshot = this.snapshot
            const snapshotLatestValues = snapshot?.latestValues || {}
            const mixedValues = { ...this.latestValues }

            const targetDelta = createDelta()
            this.relativeTarget = this.relativeTargetOrigin = undefined
            this.attemptToResolveRelativeTarget = !hasOnlyRelativeTargetChanged

            const relativeLayout = createBox()

            const isSharedLayoutAnimation = snapshot?.isShared
            const isOnlyMember = (this.getStack()?.members.length || 0) <= 1
            const shouldCrossfadeOpacity = Boolean(
                isSharedLayoutAnimation &&
                    !isOnlyMember &&
                    this.options.crossfade === true &&
                    !this.path.some(hasOpacityCrossfade)
            )

            this.mixTargetDelta = (latest: number) => {
                const progress = latest / 1000
                mixAxisDelta(targetDelta.x, delta.x, progress)
                mixAxisDelta(targetDelta.y, delta.y, progress)
                this.setTargetDelta(targetDelta)

                if (
                    this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    this.layout &&
                    this.relativeParent?.layout
                ) {
                    calcRelativePosition(
                        relativeLayout,
                        this.layout.actual,
                        this.relativeParent.layout.actual
                    )
                    mixBox(
                        this.relativeTarget,
                        this.relativeTargetOrigin,
                        relativeLayout,
                        progress
                    )
                }

                if (isSharedLayoutAnimation) {
                    this.animationValues = mixedValues

                    mixValues(
                        mixedValues,
                        snapshotLatestValues,
                        this.latestValues,
                        progress,
                        shouldCrossfadeOpacity,
                        isOnlyMember
                    )
                }

                this.root.scheduleUpdateProjection()
                this.scheduleRender()
            }

            this.mixTargetDelta(0)
        }

        startAnimation(options: AnimationOptions<number>) {
            this.currentAnimation?.stop()
            if (this.resumingFrom) {
                this.resumingFrom.currentAnimation?.stop()
            }
            if (this.pendingAnimation) {
                cancelSync.update(this.pendingAnimation)
                this.pendingAnimation = undefined
            }
            /**
             * Start the animation in the next frame to have a frame with progress 0,
             * where the target is the same as when the animation started, so we can
             * calculate the relative positions correctly for instant transitions.
             */
            this.pendingAnimation = sync.update(() => {
                globalProjectionState.hasAnimatedSinceResize = true

                this.currentAnimation = animate(0, animationTarget, {
                    ...(options as any),
                    onUpdate: (latest: number) => {
                        this.mixTargetDelta(latest)
                        options.onUpdate?.(latest)
                    },
                    onComplete: () => {
                        options.onComplete?.()
                        this.completeAnimation()
                    },
                })

                if (this.resumingFrom) {
                    this.resumingFrom.currentAnimation = this.currentAnimation
                }

                this.pendingAnimation = undefined
            })
        }

        completeAnimation() {
            if (this.resumingFrom) {
                this.resumingFrom.currentAnimation = undefined
                this.resumingFrom.preserveOpacity = undefined
            }

            this.getStack()?.exitAnimationComplete()
            this.resumingFrom =
                this.currentAnimation =
                this.animationValues =
                    undefined

            this.notifyListeners("animationComplete")
        }

        finishAnimation() {
            if (this.currentAnimation) {
                this.mixTargetDelta?.(animationTarget)
                this.currentAnimation.stop()
            }

            this.completeAnimation()
        }

        applyTransformsToTarget() {
            const { targetWithTransforms, target, layout, latestValues } =
                this.getLead()
            if (!targetWithTransforms || !target || !layout) return

            copyBoxInto(targetWithTransforms, target)

            /**
             * Apply the latest user-set transforms to the targetBox to produce the targetBoxFinal.
             * This is the final box that we will then project into by calculating a transform delta and
             * applying it to the corrected box.
             */
            transformBox(targetWithTransforms, latestValues)

            /**
             * Update the delta between the corrected box and the final target box, after
             * user-set transforms are applied to it. This will be used by the renderer to
             * create a transform style that will reproject the element from its actual layout
             * into the desired bounding box.
             */
            calcBoxDelta(
                this.projectionDeltaWithTransform!,
                this.layoutCorrected,
                targetWithTransforms!,
                latestValues
            )
        }

        /**
         * Shared layout
         */
        // TODO Only running on root node
        sharedNodes: Map<string, NodeStack> = new Map()
        registerSharedNode(layoutId: string, node: IProjectionNode) {
            if (!this.sharedNodes.has(layoutId)) {
                this.sharedNodes.set(layoutId, new NodeStack())
            }

            const stack = this.sharedNodes.get(layoutId)!
            stack.add(node)

            node.promote({
                transition: node.options.initialPromotionConfig?.transition,
                preserveFollowOpacity:
                    node.options.initialPromotionConfig?.shouldPreserveFollowOpacity?.(
                        node
                    ),
            })
        }

        isLead(): boolean {
            const stack = this.getStack()
            return stack ? stack.lead === this : true
        }

        getLead() {
            const { layoutId } = this.options
            return layoutId ? this.getStack()?.lead || this : this
        }

        getPrevLead() {
            const { layoutId } = this.options
            return layoutId ? this.getStack()?.prevLead : undefined
        }

        getStack() {
            const { layoutId } = this.options
            if (layoutId) return this.root.sharedNodes.get(layoutId)
        }

        promote({
            needsReset,
            transition,
            preserveFollowOpacity,
        }: {
            needsReset?: boolean
            transition?: Transition
            preserveFollowOpacity?: boolean
        } = {}) {
            const stack = this.getStack()
            if (stack) stack.promote(this, preserveFollowOpacity)

            if (needsReset) {
                this.projectionDelta = undefined
                this.needsReset = true
            }
            if (transition) this.setOptions({ transition })
        }

        relegate(): boolean {
            const stack = this.getStack()
            if (stack) {
                return stack.relegate(this)
            } else {
                return false
            }
        }

        resetRotation() {
            const { visualElement } = this.options

            if (!visualElement) return

            // If there's no detected rotation values, we can early return without a forced render.
            let hasRotate = false

            // Keep a record of all the values we've reset
            const resetValues = {}

            // Check the rotate value of all axes and reset to 0
            for (let i = 0; i < transformAxes.length; i++) {
                const axis = transformAxes[i]
                const key = "rotate" + axis

                // If this rotation doesn't exist as a motion value, then we don't
                // need to reset it
                if (!visualElement.getStaticValue(key)) {
                    continue
                }

                hasRotate = true

                // Record the rotation and then temporarily set it to 0
                resetValues[key] = visualElement.getStaticValue(key)
                visualElement.setStaticValue(key, 0)
            }

            // If there's no rotation values, we don't need to do any more.
            if (!hasRotate) return

            // Force a render of this element to apply the transform with all rotations
            // set to 0.
            visualElement?.syncRender()

            // Put back all the values we reset
            for (const key in resetValues) {
                visualElement.setStaticValue(key, resetValues[key])
            }

            // Schedule a render for the next frame. This ensures we won't visually
            // see the element with the reset rotate value applied.
            visualElement.scheduleRender()
        }

        getProjectionStyles(styleProp: MotionStyle = {}) {
            // TODO: Return lifecycle-persistent object
            const styles: ResolvedValues = {}
            if (!this.instance || this.isSVG) return styles

            if (!this.isVisible) {
                return { visibility: "hidden" }
            } else {
                styles.visibility = ""
            }

            const transformTemplate =
                this.options.visualElement?.getProps().transformTemplate

            if (this.needsReset) {
                this.needsReset = false

                styles.opacity = ""
                styles.pointerEvents =
                    resolveMotionValue(styleProp.pointerEvents) || ""
                styles.transform = transformTemplate
                    ? transformTemplate(this.latestValues, "")
                    : "none"
                return styles
            }

            const lead = this.getLead()
            if (!this.projectionDelta || !this.layout || !lead.target) {
                const emptyStyles: ResolvedValues = {}
                if (this.options.layoutId) {
                    emptyStyles.opacity = this.latestValues.opacity ?? 1
                    emptyStyles.pointerEvents =
                        resolveMotionValue(styleProp.pointerEvents) || ""
                }
                if (this.hasProjected && !hasTransform(this.latestValues)) {
                    emptyStyles.transform = transformTemplate
                        ? transformTemplate({}, "")
                        : "none"
                    this.hasProjected = false
                }
                return emptyStyles
            }

            const valuesToRender = lead.animationValues || lead.latestValues

            this.applyTransformsToTarget()
            styles.transform = buildProjectionTransform(
                this.projectionDeltaWithTransform!,
                this.treeScale,
                valuesToRender
            )

            if (transformTemplate) {
                styles.transform = transformTemplate(
                    valuesToRender,
                    styles.transform
                )
            }

            const { x, y } = this.projectionDelta
            styles.transformOrigin = `${x.origin * 100}% ${y.origin * 100}% 0`

            if (lead.animationValues) {
                /**
                 * If the lead component is animating, assign this either the entering/leaving
                 * opacity
                 */
                styles.opacity =
                    lead === this
                        ? valuesToRender.opacity ??
                          this.latestValues.opacity ??
                          1
                        : this.preserveOpacity
                        ? this.latestValues.opacity
                        : valuesToRender.opacityExit
            } else {
                /**
                 * Or we're not animating at all, set the lead component to its actual
                 * opacity and other components to hidden.
                 */
                styles.opacity =
                    lead === this
                        ? valuesToRender.opacity ?? ""
                        : valuesToRender.opacityExit ?? 0
            }

            /**
             * Apply scale correction
             */
            for (const key in scaleCorrectors) {
                if (valuesToRender[key] === undefined) continue

                const { correct, applyTo } = scaleCorrectors[key]
                const corrected = correct(valuesToRender[key], lead)

                if (applyTo) {
                    const num = applyTo.length
                    for (let i = 0; i < num; i++) {
                        styles[applyTo[i]] = corrected
                    }
                } else {
                    styles[key] = corrected
                }
            }

            /**
             * Disable pointer events on follow components. This is to ensure
             * that if a follow component covers a lead component it doesn't block
             * pointer events on the lead.
             */
            if (this.options.layoutId) {
                styles.pointerEvents =
                    lead === this
                        ? resolveMotionValue(styleProp.pointerEvents) || ""
                        : "none"
            }

            return styles
        }

        clearSnapshot() {
            this.resumeFrom = this.snapshot = undefined
        }

        // Only run on root
        resetTree() {
            this.root.nodes!.forEach((node: IProjectionNode) =>
                node.currentAnimation?.stop()
            )
            this.root.nodes!.forEach(clearMeasurements)
            this.root.sharedNodes.clear()
        }
    }
}

function updateLayout(node: IProjectionNode) {
    node.updateLayout()
}

function notifyLayoutUpdate(node: IProjectionNode) {
    const snapshot = node.resumeFrom?.snapshot ?? node.snapshot

    if (
        node.isLead() &&
        node.layout &&
        snapshot &&
        node.hasListeners("didUpdate")
    ) {
        const { actual: layout, measured: measuredLayout } = node.layout
        // TODO Maybe we want to also resize the layout snapshot so we don't trigger
        // animations for instance if layout="size" and an element has only changed position
        if (node.options.animationType === "size") {
            eachAxis((axis) => {
                const axisSnapshot = snapshot.isShared
                    ? snapshot.measured[axis]
                    : snapshot.layout[axis]
                const length = calcLength(axisSnapshot)
                axisSnapshot.min = layout[axis].min
                axisSnapshot.max = axisSnapshot.min + length
            })
        } else if (node.options.animationType === "position") {
            eachAxis((axis) => {
                const axisSnapshot = snapshot.isShared
                    ? snapshot.measured[axis]
                    : snapshot.layout[axis]
                const length = calcLength(layout[axis])
                axisSnapshot.max = axisSnapshot.min + length
            })
        }

        const layoutDelta = createDelta()
        calcBoxDelta(layoutDelta, layout, snapshot.layout)
        const visualDelta = createDelta()
        if (snapshot.isShared) {
            calcBoxDelta(
                visualDelta,
                node.applyTransform(measuredLayout, true),
                snapshot.measured
            )
        } else {
            calcBoxDelta(visualDelta, layout, snapshot.layout)
        }

        const hasLayoutChanged = !isDeltaZero(layoutDelta)
        let hasRelativeTargetChanged = false

        if (!node.resumeFrom) {
            node.relativeParent = node.getClosestProjectingParent()

            /**
             * If the relativeParent is itself resuming from a different element then
             * the relative snapshot is not relavent
             */
            if (node.relativeParent && !node.relativeParent.resumeFrom) {
                const { snapshot: parentSnapshot, layout: parentLayout } =
                    node.relativeParent

                if (parentSnapshot && parentLayout) {
                    const relativeSnapshot = createBox()
                    calcRelativePosition(
                        relativeSnapshot,
                        snapshot.layout,
                        parentSnapshot.layout
                    )

                    const relativeLayout = createBox()
                    calcRelativePosition(
                        relativeLayout,
                        layout,
                        parentLayout.actual
                    )

                    if (!boxEquals(relativeSnapshot, relativeLayout)) {
                        hasRelativeTargetChanged = true
                    }
                }
            }
        }

        node.notifyListeners("didUpdate", {
            layout,
            snapshot,
            delta: visualDelta,
            layoutDelta,
            hasLayoutChanged,
            hasRelativeTargetChanged,
        })
    } else if (node.isLead()) {
        node.options.onExitComplete?.()
    }

    /**
     * Clearing transition
     * TODO: Investigate why this transition is being passed in as {type: false } from Framer
     * and why we need it at all
     */
    node.options.transition = undefined
}

function clearSnapshot(node: IProjectionNode) {
    node.clearSnapshot()
}

function clearMeasurements(node: IProjectionNode) {
    node.clearMeasurements()
}

function resetTransformStyle(node: IProjectionNode) {
    node.resetTransform()
}

function finishAnimation(node: IProjectionNode) {
    node.finishAnimation()
    node.targetDelta = node.relativeTarget = node.target = undefined
}

function resolveTargetDelta(node: IProjectionNode) {
    node.resolveTargetDelta()
}

function calcProjection(node: IProjectionNode) {
    node.calcProjection()
}

function resetRotation(node: IProjectionNode) {
    node.resetRotation()
}

function removeLeadSnapshots(stack: NodeStack) {
    stack.removeLeadSnapshot()
}

export function mixAxisDelta(output: AxisDelta, delta: AxisDelta, p: number) {
    output.translate = mix(delta.translate, 0, p)
    output.scale = mix(delta.scale, 1, p)
    output.origin = delta.origin
    output.originPoint = delta.originPoint
}

export function mixAxis(output: Axis, from: Axis, to: Axis, p: number) {
    output.min = mix(from.min, to.min, p)
    output.max = mix(from.max, to.max, p)
}

export function mixBox(output: Box, from: Box, to: Box, p: number) {
    mixAxis(output.x, from.x, to.x, p)
    mixAxis(output.y, from.y, to.y, p)
}

function hasOpacityCrossfade(node: IProjectionNode) {
    return (
        node.animationValues && node.animationValues.opacityExit !== undefined
    )
}

const defaultLayoutTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}

function mountNodeEarly(node: IProjectionNode, id: number) {
    /**
     * Rather than searching the DOM from document we can search the
     * path for the deepest mounted ancestor and search from there
     */
    let searchNode = node.root
    for (let i = node.path.length - 1; i >= 0; i--) {
        if (Boolean(node.path[i].instance)) {
            searchNode = node.path[i]
            break
        }
    }
    const searchElement =
        searchNode && searchNode !== node.root ? searchNode.instance : document

    const element = (searchElement as Element).querySelector(
        `[data-projection-id="${id}"]`
    )
    if (element) node.mount(element, true)
}

function roundAxis(axis: Axis): void {
    axis.min = Math.round(axis.min)
    axis.max = Math.round(axis.max)
}

function roundBox(box: Box): void {
    roundAxis(box.x)
    roundAxis(box.y)
}
