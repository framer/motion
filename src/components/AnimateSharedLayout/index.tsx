import * as React from "react"
import {
    Presence,
    SharedLayoutProps,
    SharedLayoutSyncMethods,
    SyncLayoutLifecycles,
} from "./types"
import { LayoutStack, layoutStack } from "./utils/stack"
import { SharedLayoutContext } from "../../context/SharedLayoutContext"
import { MotionContext, MotionContextProps } from "../../context/MotionContext"
import { resetRotate } from "./utils/rotate"
import { VisualElement } from "../../render/types"
import { createBatcher } from "./utils/batcher"

/**
 * @public
 */
export class AnimateSharedLayout extends React.Component<
    SharedLayoutProps,
    {},
    VisualElement
> {
    static contextType = MotionContext

    /**
     * A list of all the children in the shared layout
     */
    private children = new Set<VisualElement>()

    /**
     * As animate components with a defined `layoutId` are added/removed to the tree,
     * we store them in order. When one is added, it will animate out from the
     * previous one, and when it's removed, it'll animate to the previous one.
     */
    private stacks: Map<string, LayoutStack> = new Map()

    /**
     * Track whether the component has mounted. If it hasn't, the presence of added children
     * are set to Present, whereas if it has they're considered Entering
     */
    private hasMounted = false

    /**
     * Track whether we already have an update scheduled. If we don't, we'll run snapshots
     * and schedule one.
     */
    private updateScheduled = false

    /**
     * Tracks whether we already have a render scheduled. If we don't, we'll force one with this.forceRender
     */
    private renderScheduled = false

    /**
     * The methods provided to all children in the shared layout tree.
     */
    syncContext: SharedLayoutSyncMethods = {
        ...createBatcher(),
        syncUpdate: (force) => this.scheduleUpdate(force),
        forceUpdate: () => {
            // By copying syncContext to itself, when this component re-renders it'll also re-render
            // all children subscribed to the SharedLayout context.
            this.syncContext = { ...this.syncContext }
            this.scheduleUpdate(true)
        },
        register: (child) => this.addChild(child),
        remove: (child) => this.removeChild(child),
    }

    componentDidMount() {
        this.hasMounted = true
    }

    componentDidUpdate() {
        this.startLayoutAnimation()
    }

    shouldComponentUpdate() {
        this.renderScheduled = true
        return true
    }

    private startLayoutAnimation() {
        /**
         * Reset update and render scheduled status
         */
        this.renderScheduled = this.updateScheduled = false

        const { type } = this.props

        /**
         * Update presence metadata based on the latest AnimatePresence status.
         * This is a kind of goofy way of dealing with this, perhaps there's a better model to find.
         */
        this.children.forEach((child) => {
            if (!child.isPresent) {
                child.presence = Presence.Exiting
            } else if (child.presence !== Presence.Entering) {
                child.presence =
                    child.presence === Presence.Exiting
                        ? Presence.Entering
                        : Presence.Present
            }
        })

        this.updateStacks()

        /**
         * Create a handler which we can use to flush the children animations
         */
        const handler: SyncLayoutLifecycles = {
            measureLayout: (child) => child.updateLayoutMeasurement(),
            layoutReady: (child) => {
                if (child.getLayoutId() !== undefined) {
                    const stack = this.getStack(child)!
                    stack.animate(child, type === "crossfade")
                } else {
                    child.notifyLayoutReady()
                }
            },
            parent: (this.context as MotionContextProps).visualElement,
        }

        /**
         * Shared layout animations can be used without the AnimateSharedLayout wrapping component.
         * This requires some co-ordination across components to stop layout thrashing
         * and ensure measurements are taken at the correct time.
         *
         * Here we use that same mechanism of schedule/flush.
         */
        this.children.forEach((child) => this.syncContext.add(child))
        this.syncContext.flush(handler)

        /**
         * Clear snapshots so subsequent rerenders don't retain memory of outgoing components
         */
        this.stacks.forEach((stack) => stack.clearSnapshot())
    }

    updateStacks() {
        this.stacks.forEach((stack) => stack.updateLeadAndFollow())
    }

    private scheduleUpdate(force = false) {
        if (!(force || !this.updateScheduled)) return

        /**
         * Flag we've scheduled an update
         */
        this.updateScheduled = true

        /**
         * Write: Reset rotation transforms so bounding boxes can be accurately measured.
         */
        this.children.forEach((child) => resetRotate(child))

        /**
         * Read: Snapshot children
         */
        this.children.forEach((child) => child.snapshotViewportBox())

        /**
         * Every child keeps a local snapshot, but we also want to record
         * snapshots of the visible children as, if they're are being removed
         * in this render, we can still access them.
         *
         * TODO: What would be better here is doing a single loop where we
         * only snapshotViewportBoxes of undefined layoutIds and then one for each stack
         */
        this.stacks.forEach((stack) => stack.updateSnapshot())

        /**
         * Force a rerender by setting state if we aren't already going to render.
         */
        if (force || !this.renderScheduled) {
            this.renderScheduled = true
            this.forceUpdate()
        }
    }

    private addChild(child: VisualElement) {
        this.children.add(child)
        this.addToStack(child)

        child.presence = this.hasMounted ? Presence.Entering : Presence.Present
    }

    private removeChild(child: VisualElement) {
        this.scheduleUpdate()
        this.children.delete(child)
        this.removeFromStack(child)
    }

    private addToStack(child: VisualElement) {
        const stack = this.getStack(child)
        stack?.add(child)
    }

    private removeFromStack(child: VisualElement) {
        const stack = this.getStack(child)
        stack?.remove(child)
    }

    /**
     * Return a stack of animate children based on the provided layoutId.
     * Will create a stack if none currently exists with that layoutId.
     */
    private getStack(child: VisualElement): LayoutStack | undefined {
        const id = child.getLayoutId()
        if (id === undefined) return

        // Create stack if it doesn't already exist
        !this.stacks.has(id) && this.stacks.set(id, layoutStack())

        return this.stacks.get(id) as LayoutStack
    }

    render() {
        return (
            <SharedLayoutContext.Provider value={this.syncContext}>
                {this.props.children}
            </SharedLayoutContext.Provider>
        )
    }
}
