import sync, { cancelSync, flushSync } from "framesync"
import {
    applyBoxDelta,
    applyTreeDeltas,
    resetBox,
} from "../geometry/delta-apply"
import { calcBoxDelta } from "../geometry/delta-calc"
import { createBox, createDelta } from "../geometry/models"
import { translateAxis } from "../geometry/operations"
import { Axis, Box, Delta, Point } from "../geometry/types"
import { buildProjectionTransform } from "../styles/transform"
import { eachAxis } from "../utils/each-axis"

export interface IProjectionNode {
    parent?: IProjectionNode
    root?: IProjectionNode
    children: Set<IProjectionNode>
    path: IProjectionNode[]
    options: ProjectionNodeOptions
    layout?: Box
    snapshot?: Box
    scroll?: Point
    projectionDelta?: Delta
    isLayoutDirty: boolean
    updateLayout(): void
    updateScroll(): void
    scheduleUpdateProjection(): void
    resolveTargetDelta(): void
    calcProjection(): void
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
    applyScroll?: boolean
    onLayoutUpdate?: ({
        layout,
        snapshot,
        delta,
    }: {
        layout: Box
        snapshot: Box
        delta: Delta
    }) => void
    onProjectionUpdate?: () => void
}

export type ProjectionEventName = "layoutUpdate" | "projectionUpdate"

export function createProjectionNode<I>({
    attachResizeListener,
    defaultParent,
    measureScroll,
    measureViewportBox,
}: ProjectionNodeConfig<I>) {
    return class ProjectionNode implements IProjectionNode {
        instance: I

        root: IProjectionNode

        parent: IProjectionNode

        path: IProjectionNode[]

        children = new Set<IProjectionNode>()

        options: ProjectionNodeOptions

        snapshot: Box | undefined

        layout: Box | undefined

        layoutCorrected: Box

        scroll?: Point

        isLayoutDirty: boolean

        treeScale: Point = { x: 1, y: 1 } // TODO Lazy-initialise

        targetDelta?: Delta

        projectionDelta?: Delta

        target?: Box

        constructor(
            instance: I,
            options: ProjectionNodeOptions = {},
            parent?: IProjectionNode
        ) {
            this.instance = instance
            this.parent = parent
                ? parent
                : (defaultParent?.() as IProjectionNode)
            if (this.parent) this.parent.children.add(this)
            this.root = this.parent ? this.parent.root || this.parent : this
            this.path = this.parent ? [...this.parent.path, this.parent] : []
            this.options = options

            if (attachResizeListener) {
            }
        }

        destructor() {
            if (this.parent) {
                this.parent.children.delete(this)
            }
            cancelSync.preRender(this.updateProjection)
        }

        /**
         * Lifecycles
         */
        willUpdate() {
            // Maybe will need to read the scroll position of window
            this.updateSnapshot()
            this.isLayoutDirty = true
        }

        // Note: Currently only running on root node
        didUpdate() {
            /**
             * Read ==================
             */
            // Update window scroll position. Perhaps we make this as part
            // of updateLayoutTree
            this.updateScroll()

            // Update layout measurements of updated children
            updateTreeLayout(this)

            /**
             * Write
             */
            // Notify listeners that the layout is updated
            notifyLayoutUpdate(this)

            // Flush any scheduled updates
            flushSync.update()
            flushSync.preRender()
            flushSync.render()
        }

        scheduleUpdateProjection() {
            sync.preRender(this.updateProjection, false, true)
        }

        updateProjection = () => {
            updateProjectionTree(this)
        }

        /**
         * Update measurements
         */
        updateSnapshot() {
            if (!measureViewportBox) return
            // TODO: Only do once per update batch or if scroll is dirty (preferable)
            this.root.updateScroll()
            this.snapshot = this.measure()
        }

        updateLayout() {
            this.layout = this.measure()
            this.layoutCorrected = createBox()
            this.isLayoutDirty = false
        }

        updateScroll() {
            if (!measureScroll) return
            this.scroll = measureScroll(this.instance)
        }

        measure() {
            if (!measureScroll) return
            if (!measureViewportBox) return
            const box = measureViewportBox(this.instance)

            // Offset by the page scroll
            const pageScroll = this.root.scroll
            if (pageScroll) {
                eachAxis((axis) => translateAxis(box[axis], pageScroll[axis]))
            }

            return box
        }

        /**
         *
         */
        setTargetDelta(delta: Delta) {
            this.targetDelta = delta

            if (!this.projectionDelta) this.projectionDelta = createDelta()
            this.root.scheduleUpdateProjection()
        }

        /**
         * Frame calculations
         */
        resolveTargetDelta() {
            if (!this.targetDelta) return
            if (!this.layout) return
            if (!this.target) this.target = createBox()

            resetBox(this.target, this.layout)
            applyBoxDelta(this.target, this.targetDelta)
        }

        calcProjection() {
            if (!this.layout) return
            if (!this.target) return
            if (!this.projectionDelta) return
            /**
             * Reset the corrected box with the latest values from box, as we're then going
             * to perform mutative operations on it.
             */
            resetBox(this.layoutCorrected, this.layout)

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
                this.target
            ) // origin)

            // TODO Make this event listener
            const { onProjectionUpdate } = this.options
            onProjectionUpdate && onProjectionUpdate()
        }

        getProjectionStyles() {
            if (!this.projectionDelta) return {}
            // Resolve crossfading props and viewport boxes
            // TODO: Only return if projecting
            // TODO: Apply user-set transforms to targetBox
            // TODO: calcBoxDelta to final box
            // TODO: Return mutable object
            return {
                transform: buildProjectionTransform(
                    this.projectionDelta,
                    this.treeScale
                ),
            }
        }
    }
}

function updateTreeLayout(node: IProjectionNode) {
    node.isLayoutDirty && node.updateLayout()
    node.children.forEach(updateTreeLayout)
}

function notifyLayoutUpdate(node: IProjectionNode) {
    const { onLayoutUpdate } = node.options
    if (onLayoutUpdate) {
        const { layout, snapshot } = node
        if (layout && snapshot) {
            const delta = createDelta()
            calcBoxDelta(delta, layout, snapshot)

            onLayoutUpdate({ layout, snapshot, delta })
        }
    }

    node.children.forEach(notifyLayoutUpdate)
}

function updateProjectionTree(node: IProjectionNode) {
    resolveTreeTargetDeltas(node)
    calcTreeProjection(node)
}

function resolveTreeTargetDeltas(node: IProjectionNode) {
    node.resolveTargetDelta()
    node.children.forEach(resolveTreeTargetDeltas)
}

function calcTreeProjection(node: IProjectionNode) {
    node.calcProjection()
    node.children.forEach(calcTreeProjection)
}

function calcLength(axis: Axis) {
    return axis.max - axis.min
}
export function calcRelativeAxis(target: Axis, relative: Axis, parent: Axis) {
    target.min = parent.min + relative.min
    target.max = target.min + calcLength(relative)
}
