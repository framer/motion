import sync, { cancelSync, flushSync } from "framesync"
import { copyBoxInto } from "../geometry/copy"
import { applyBoxDelta, applyTreeDeltas } from "../geometry/delta-apply"
import { calcBoxDelta } from "../geometry/delta-calc"
import { createBox, createDelta } from "../geometry/models"
import { translateAxis } from "../geometry/operations"
import { Box, Delta, Point } from "../geometry/types"
import { buildProjectionTransform } from "../styles/transform"
import { eachAxis } from "../utils/each-axis"

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
    scroll?: Point
    projectionDelta?: Delta
    isLayoutDirty: boolean
    willUpdate(): void
    didUpdate(): void
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
    shouldMeasureScroll?: boolean
    onLayoutUpdate?: ({
        layout,
        snapshot,
        delta,
    }: {
        layout: Box
        snapshot: Snapshot
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
    return class ProjectionNode implements IProjectionNode<I> {
        instance: I

        root: IProjectionNode

        parent: IProjectionNode

        path: IProjectionNode[]

        children = new Set<IProjectionNode>()

        options: ProjectionNodeOptions

        snapshot: Snapshot | undefined

        layout: Box | undefined

        layoutCorrected: Box

        scroll?: Point

        isLayoutDirty: boolean

        treeScale: Point = { x: 1, y: 1 } // TODO Lazy-initialise

        targetDelta?: Delta

        projectionDelta?: Delta

        target?: Box

        constructor(parent?: IProjectionNode) {
            this.parent = parent
                ? parent
                : (defaultParent?.() as IProjectionNode)

            if (this.parent) this.parent.children.add(this)
            this.root = this.parent ? this.parent.root || this.parent : this
            this.path = this.parent ? [...this.parent.path, this.parent] : []

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
        mount(instance: I) {
            this.instance = instance
        }

        willUpdate() {
            /**
             * TODO: Check we haven't updated the scroll
             * since the last didUpdate
             */
            this.path.forEach((node) => node.updateScroll())

            // Maybe will need to read the scroll position of window
            this.updateSnapshot()
            this.isLayoutDirty = true
        }

        // Note: Currently only running on root node
        didUpdate() {
            /**
             * Read ==================
             */
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

            const visible = this.measure()!
            this.snapshot = {
                visible,
                layout: this.removeElementScroll(visible!),
            }
        }

        updateLayout() {
            // TODO: Incorporate into a forwarded
            // scroll offset
            if (this.options.shouldMeasureScroll) {
                this.updateScroll()
            }

            if (!this.isLayoutDirty) return

            this.layout = this.removeElementScroll(this.measure()!)
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

            // Remove window scroll to give page-relative coordinates
            const { scroll } = this.root
            scroll && eachAxis((axis) => translateAxis(box[axis], scroll[axis]))

            return box
        }

        removeElementScroll(box: Box) {
            const boxWithoutScroll = createBox()
            copyBoxInto(boxWithoutScroll, box)
            // TODO: Keep a culmulative scroll offset rather
            // than loop through
            this.path.forEach((node) => {
                if (
                    node !== this.root &&
                    node.scroll &&
                    node.options.shouldMeasureScroll
                ) {
                    const { scroll } = node
                    eachAxis((axis) =>
                        translateAxis(boxWithoutScroll[axis], scroll[axis])
                    )
                }
            })

            return boxWithoutScroll
        }

        /**
         *
         */
        setTargetDelta(delta: Delta) {
            this.targetDelta = delta

            if (!this.projectionDelta) this.projectionDelta = createDelta()
            this.root.scheduleUpdateProjection()
        }

        setOptions(options: ProjectionNodeOptions) {
            this.options = options
        }

        /**
         * Frame calculations
         */
        resolveTargetDelta() {
            if (!this.targetDelta) return
            if (!this.layout) return
            if (!this.target) this.target = createBox()

            copyBoxInto(this.target, this.layout)
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
    node.updateLayout()
    node.children.forEach(updateTreeLayout)
}

function notifyLayoutUpdate(node: IProjectionNode) {
    const { onLayoutUpdate } = node.options
    if (onLayoutUpdate) {
        const { layout, snapshot } = node
        if (layout && snapshot) {
            const delta = createDelta()

            /**
             * TODO: Create delta to see if layout has
             * changed and pass that data through
             */
            console.log(snapshot.layout.x.min, layout.x.min)
            calcBoxDelta(delta, layout, snapshot.layout)
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
