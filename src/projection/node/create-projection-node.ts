import sync, { cancelSync, flushSync } from "framesync"
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
import { calcBoxDelta, calcLength } from "../geometry/delta-calc"
import { removeBoxTransforms } from "../geometry/delta-remove"
import { createBox, createDelta } from "../geometry/models"
import { transformBox, translateAxis } from "../geometry/operations"
import { AxisDelta, Box, Delta, Point } from "../geometry/types"
import { getValueTransition } from "../../animation/utils/transitions"
import { boxEquals, isDeltaZero } from "../geometry/utils"
import { NodeStack } from "../shared/stack"
import { scaleCorrectors } from "../styles/scale-correction"
import { buildProjectionTransform } from "../styles/transform"
import { eachAxis } from "../utils/each-axis"
import { hasScale, hasTransform } from "../utils/has-transform"
import {
    IProjectionNode,
    LayoutEvents,
    LayoutUpdateData,
    ProjectionNodeConfig,
    ProjectionNodeOptions,
    Snapshot,
} from "./types"
import { transformAxes } from "../../render/html/utils/transform"
import { FlatTree } from "../../render/utils/flat-tree"

/**
 * Global flag as to whether the tree has animated since the last time
 * we reszied the window
 */
let hasAnimated = true

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
        layout: Box | undefined

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
        updateBlocked = false

        /**
         * We set this to true once, on the first update. Any nodes added to the tree beyond that
         * update will be given a `data-projection-id` attribute.
         */
        hasEverUpdated = false

        /**
         * Set to true between the start of the first `willUpdate` call and the end of the `didUpdate`
         * call.
         */
        isUpdating = false

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

        constructor(
            id: number | undefined,
            latestValues: ResolvedValues,
            parent: IProjectionNode | undefined = defaultParent?.()
        ) {
            this.id = id
            this.latestValues = latestValues
            this.root = parent ? parent.root || parent : this
            this.path = parent ? [...parent.path, parent] : []
            this.parent = parent

            this.depth = parent ? parent.depth + 1 : 0

            id && this.root.registerPotentialNode(id, this)

            if (this.root === this) {
                this.nodes = new FlatTree()
            }
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
            this.instance = instance

            const { layoutId, layout, visualElement } = this.options
            if (visualElement && !visualElement.getInstance()) {
                visualElement.mount(instance)
            }

            this.parent?.children.add(this)
            this.id && this.root.potentialNodes.delete(this.id)

            if (isLayoutDirty) {
                this.isLayoutDirty = true
                this.setTargetDelta(createDelta())
            }

            attachResizeListener?.(instance, () => {
                if (hasAnimated) {
                    hasAnimated = false
                    this.nodes!.forEach(finishAnimation)
                }
            })

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
                        layout: newLayout,
                    }: LayoutUpdateData) => {
                        // TODO: Check here if an animation exists
                        const layoutTransition =
                            visualElement.getDefaultTransition() ||
                            defaultLayoutTransition

                        const {
                            onLayoutAnimationComplete,
                        } = visualElement.getProps()

                        const targetChanged =
                            !this.targetLayout ||
                            !boxEquals(this.targetLayout, newLayout)

                        if (
                            // If the element is animating from another element,
                            // we should force the animation even if they have
                            // the same layout
                            (hasLayoutChanged || this.resumeFrom) &&
                            // If there's a current animation and the target hasn't changed, ignore
                            (targetChanged || !this.currentAnimation)
                        ) {
                            this.setAnimationOrigin(delta)
                            this.startAnimation({
                                ...getValueTransition(
                                    layoutTransition,
                                    "layout"
                                ),
                                onComplete: onLayoutAnimationComplete,
                            })
                        }

                        this.targetLayout = newLayout
                    }
                )
            }
        }

        hasPendingLead(layoutId: string) {
            if (!this.potentialNodes.size) return false
            for (const potentialNode of this.potentialNodes.values()) {
                if (potentialNode.options.layoutId === layoutId) return true
            }
            return false
        }

        unmount() {
            this.options.layoutId && this.willUpdate()

            this.getStack()?.remove(this)
            this.parent?.children.delete(this)

            cancelSync.preRender(this.updateProjection)
        }

        // only on the root
        blockUpdate() {
            this.updateBlocked = true
        }

        unblockUpdate() {
            this.updateBlocked = false
        }

        // Note: currently only running on root node
        startUpdate() {
            if (this.updateBlocked) return
            this.hasEverUpdated = this.isUpdating = true
            this.nodes?.forEach(resetRotation)
        }

        willUpdate(shouldNotifyListeners = true) {
            if (this.root.updateBlocked) return
            !this.root.isUpdating && this.root.startUpdate()
            if (this.isLayoutDirty) return

            this.isLayoutDirty = true

            // TODO: Replace with path loop
            this.path.forEach((node) => {
                node.shouldResetTransform = true

                /**
                 * TODO: Check we haven't updated the scroll
                 * since the last didUpdate
                 */
                node.updateScroll()
            })

            this.updateSnapshot()
            shouldNotifyListeners && this.notifyListeners("willUpdate")
        }

        // Note: Currently only running on root node
        didUpdate() {
            if (this.updateBlocked) this.unblockUpdate()
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
            this.nodes!.forEach(clearSnapshot)

            // Flush any scheduled updates
            flushSync.update()
            flushSync.preRender()
            flushSync.render()
        }

        scheduleUpdateProjection() {
            sync.preRender(this.updateProjection, false, true)
        }

        updateProjection = () => {
            this.nodes!.forEach(resolveTargetDelta)
            this.nodes!.forEach(calcProjection)
        }

        /**
         * Update measurements
         */
        updateSnapshot() {
            if (this.snapshot) return

            const visible = this.removeTransform(this.measure()!)
            this.snapshot = {
                visible,
                layout: this.removeElementScroll(visible!),
                latestValues: {},
            }
        }

        updateLayout() {
            // TODO: Incorporate into a forwarded
            // scroll offset
            if (this.options.shouldMeasureScroll) {
                this.updateScroll()
            }

            if (!this.options.alwaysMeasureLayout && !this.isLayoutDirty) return

            this.layout = this.removeElementScroll(this.measure())
            this.layoutCorrected = createBox()
            this.isLayoutDirty = false
            this.projectionDelta = undefined
            this.notifyListeners("measure")
        }

        updateScroll() {
            if (!measureScroll) return
            this.scroll = measureScroll(this.instance)
        }

        resetTransform() {
            if (
                resetTransform &&
                (this.isLayoutDirty || this.shouldResetTransform) &&
                ((this.projectionDelta && !isDeltaZero(this.projectionDelta)) ||
                    hasTransform(this.latestValues))
            ) {
                resetTransform(this.instance)
                this.shouldResetTransform = false
                this.options.onProjectionUpdate?.()
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
                if (
                    node !== this.root &&
                    scroll &&
                    options.shouldMeasureScroll
                ) {
                    translateAxis(boxWithoutScroll.x, scroll.x)
                    translateAxis(boxWithoutScroll.y, scroll.y)
                }
            }

            return boxWithoutScroll
        }

        removeTransform(box: Box): Box {
            const boxWithoutTransform = createBox()
            copyBoxInto(boxWithoutTransform, box)

            for (let i = 0; i < this.path.length; i++) {
                const node = this.path[i]
                if (!hasTransform(node.latestValues)) continue

                hasScale(node.latestValues) && node.updateSnapshot()

                removeBoxTransforms(
                    boxWithoutTransform,
                    node.latestValues,
                    node.snapshot?.layout
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
            this.options = { ...options, crossfade: options.crossfade ?? true }
        }

        clearMeasurements() {
            this.scroll = undefined
            this.layout = undefined
            this.snapshot = undefined
            this.children.forEach((child) => child.clearMeasurements())
        }
        /**
         * Frame calculations
         */
        resolveTargetDelta() {
            if (!this.targetDelta || !this.layout) return

            if (!this.target) {
                this.target = createBox()
                this.targetWithTransforms = createBox()
            }

            copyBoxInto(this.target, this.layout)
            applyBoxDelta(this.target, this.targetDelta)
        }

        calcProjection() {
            const { target } = this.getLead()

            if (!this.layout || !target) return

            if (!this.projectionDelta) {
                this.projectionDelta = createDelta()
                this.projectionDeltaWithTransform = createDelta()
            }

            /**
             * Reset the corrected box with the latest values from box, as we're then going
             * to perform mutative operations on it.
             */
            copyBoxInto(this.layoutCorrected, this.layout)

            /**
             * Apply all the parent deltas to this box to produce the corrected box. This
             * is the layout box, as it will appear on screen as a result of the transforms of its parents.
             */
            applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path)

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

            // TODO Make this event listener
            const { onProjectionUpdate } = this.options
            onProjectionUpdate && onProjectionUpdate()
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

        scheduleRender() {
            // TODO Rename this option
            this.options.onProjectionUpdate?.()
        }

        /**
         * Animation
         */
        animationProgress = 0
        animationValues?: ResolvedValues
        currentAnimation?: AnimationPlaybackControls
        mixTargetDelta: (progress: number) => void

        setAnimationOrigin(delta: Delta) {
            const snapshot = this.snapshot
            const snapshotLatestValues = snapshot?.latestValues || {}
            const mixedValues = { ...this.latestValues }

            const targetDelta = createDelta()

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

                this.setTargetDelta(targetDelta)
                this.root.scheduleUpdateProjection()
            }

            this.mixTargetDelta(0)
        }

        startAnimation(options: AnimationOptions<number>) {
            hasAnimated = true
            this.currentAnimation?.stop()
            this.currentAnimation = animate(0, 1000, {
                ...(options as any),
                onUpdate: (latest: number) => {
                    this.mixTargetDelta(latest)
                    options.onUpdate?.(latest)
                },
                onComplete: () => {
                    this.currentAnimation = this.animationValues = undefined
                    options.onComplete?.()
                    this.getStack()?.exitAnimationComplete()
                },
            })
        }

        finishAnimation() {
            if (!this.currentAnimation) return

            this.currentAnimation.stop()
            this.mixTargetDelta(1)
        }

        applyTransformsToTarget() {
            const {
                targetWithTransforms,
                target,
                latestValues,
            } = this.getLead()
            if (!targetWithTransforms || !target) return

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
        }

        isLead(): boolean {
            const stack = this.getStack()
            return stack ? stack.lead === this : true
        }

        getLead() {
            const { layoutId } = this.options
            return layoutId ? this.getStack()?.lead || this : this
        }

        getStack() {
            const { layoutId } = this.options
            if (layoutId) return this.root.sharedNodes.get(layoutId)
        }

        promote() {
            const stack = this.getStack()
            if (stack) stack.promote(this)
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

        getProjectionStyles() {
            // TODO: Return lifecycle-persistent object
            const styles: ResolvedValues = {}

            if (!this.isVisible) {
                return { visibility: "hidden" }
            } else {
                styles.visibility = ""
            }

            const lead = this.getLead()

            if (
                !this.projectionDelta ||
                !this.layout ||
                (this === lead && !this.target) ||
                (this !== lead && !lead.target)
            ) {
                return emptyStyles
            }

            const valuesToRender = lead.animationValues || lead.latestValues

            this.applyTransformsToTarget()
            styles.transform = buildProjectionTransform(
                this.projectionDeltaWithTransform!,
                this.treeScale,
                valuesToRender
            )

            const transformTemplate = this.options.visualElement?.getProps()
                .transformTemplate
            if (transformTemplate) {
                styles.transform = transformTemplate(
                    valuesToRender,
                    styles.transform
                )
            }

            // TODO Move into stand-alone, testable function
            const { x, y } = this.projectionDelta
            styles.transformOrigin = `${x.origin * 100}% ${y.origin * 100}% 0`

            if (!lead.animationValues) {
                // snap opacity to full 0/1 when the animation is finished
                styles.opacity =
                    lead === this
                        ? valuesToRender.opacity ?? ""
                        : valuesToRender.opacityExit ?? 0
            } else {
                styles.opacity =
                    lead === this
                        ? valuesToRender.opacity ??
                          this.latestValues.opacity ??
                          1
                        : valuesToRender.opacityExit
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

            return styles
        }

        clearSnapshot() {
            this.snapshot = undefined
            this.resumeFrom = undefined
        }
    }
}

const emptyStyles = {}

function updateLayout(node: IProjectionNode) {
    node.updateLayout()
}

function notifyLayoutUpdate(node: IProjectionNode) {
    const { layout } = node
    const snapshot = node.resumeFrom?.snapshot ?? node.snapshot
    if (node.isLead() && layout && snapshot && node.hasListeners("didUpdate")) {
        // TODO Maybe we want to also resize the layout snapshot so we don't trigger
        // animations for instance if layout="size" and an element has only changed position
        if (node.options.animationType === "size") {
            eachAxis((axis) => {
                const axisSnapshot = snapshot.visible[axis]
                const length = calcLength(axisSnapshot)
                axisSnapshot.min = layout[axis].min
                axisSnapshot.max = axisSnapshot.min + length
            })
        } else if (node.options.animationType === "position") {
            eachAxis((axis) => {
                const axisSnapshot = snapshot.visible[axis]
                const length = calcLength(layout[axis])
                axisSnapshot.max = axisSnapshot.min + length
            })
        }

        const layoutDelta = createDelta()
        calcBoxDelta(layoutDelta, layout, snapshot.layout)
        const visualDelta = createDelta()
        calcBoxDelta(visualDelta, layout, snapshot.visible)

        node.notifyListeners("didUpdate", {
            layout,
            snapshot,
            delta: visualDelta,
            hasLayoutChanged: !isDeltaZero(layoutDelta),
        })
    }
}

function clearSnapshot(node: IProjectionNode) {
    node.clearSnapshot()
}

function resetTransformStyle(node: IProjectionNode) {
    node.resetTransform()
}

function finishAnimation(node: IProjectionNode) {
    node.finishAnimation()
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

export function mixAxisDelta(output: AxisDelta, delta: AxisDelta, p: number) {
    output.translate = mix(delta.translate, 0, p)
    output.scale = mix(delta.scale, 1, p)
    output.origin = delta.origin
    output.originPoint = delta.originPoint
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
    const element = document.querySelector(`[data-projection-id="${id}"]`)
    if (element) node.mount(element, true)
}
