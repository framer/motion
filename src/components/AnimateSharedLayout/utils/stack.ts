import { Presence, SharedLayoutAnimationConfig } from "../types"
import { AxisBox2D, Point2D } from "../../../types/geometry"
import { ResolvedValues, VisualElement } from "../../../render/types"
import { motionValue } from "../../../value"
import { animate } from "../../../animation/animate"
import { createVisualState, VisualState } from "../../../render/utils/state"
import { circOut, linear, mix, progress } from "popmotion"
import { getFrameData } from "framesync"
import { EasingFunction } from "../../../types"

export interface Snapshot {
    isDragging?: boolean
    cursorProgress?: Point2D
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
}

export type LeadAndFollow = [
    VisualElement | undefined,
    VisualElement | undefined
]

/**
 * For each layout animation, we want to identify two components
 * within a stack that will serve as the "lead" and "follow" components.
 *
 * In the switch animation, the lead component performs the entire animation.
 * It uses the follow bounding box to animate out from and back to. The follow
 * component is hidden.
 *
 * In the crossfade animation, both the lead and follow components perform
 * the entire animation, animating from the follow origin bounding box to the lead
 * target bounding box.
 *
 * Generalising a stack as First In Last Out, *searching from the end* we can
 * generally consider the lead component to be:
 *  - If the last child is present, the last child
 *  - If the last child is exiting, the last *encountered* exiting component
 */
// export function findLeadAndFollow(
//     stack: VisualElement[],
//     [prevLead, prevFollow]: LeadAndFollow
// ): LeadAndFollow {
//     let lead: VisualElement | undefined = undefined
//     let leadIndex = 0
//     let follow: VisualElement | undefined = undefined

//     // Find the lead child first
//     const numInStack = stack.length
//     let lastIsPresent: boolean | undefined = false

//     for (let i = numInStack - 1; i >= 0; i--) {
//         const child = stack[i]

//         const isLastInStack = i === numInStack - 1
//         if (isLastInStack) lastIsPresent = child.isPresent

//         if (lastIsPresent) {
//             lead = child
//         } else {
//             // If the child before this will be present, make this the
//             // lead.
//             const prev = stack[i - 1]
//             if (prev && prev.isPresent) lead = child
//         }

//         if (lead) {
//             leadIndex = i
//             break
//         }
//     }

//     if (!lead) lead = stack[0]

//     // Find the follow child
//     follow = stack[leadIndex - 1]

//     // If the lead component is exiting, find the closest follow
//     // present component
//     if (lead) {
//         for (let i = leadIndex - 1; i >= 0; i--) {
//             const child = stack[i]
//             if (child.isPresent) {
//                 follow = child
//                 break
//             }
//         }
//     }

//     // If the lead has changed and the previous lead still exists in the
//     // stack, set it to the previous lead. This allows us to differentiate between
//     // a, b, c(exit) -> a, b(exit), c(exit)
//     // and
//     // a, b(exit), c -> a, b(exit), c(exit)
//     if (
//         lead !== prevLead &&
//         !lastIsPresent &&
//         follow === prevFollow &&
//         stack.find((stackChild) => stackChild === prevLead)
//     ) {
//         lead = prevLead
//     }

//     return [lead, follow]
// }

export interface LayoutStack {
    add(element: VisualElement): void
    remove(element: VisualElement): void
    getLead(): VisualElement | undefined
    updateSnapshot(): void
    clearSnapshot(): void
    animate(element: VisualElement, crossfade: boolean): void
    updateLeadAndFollow(): void
}

export interface CrossfadeState {
    isCrossfading(): boolean
    getValues(element: VisualElement): VisualState
    crossfadeFromLead(): void
    crossfadeToLead(): void
    reset(): void
}

// TODO: This whole file can do with rewriting
export function createCrossfadeState(state: StackState): CrossfadeState {
    let followValues = createVisualState({})
    let leadValues = createVisualState({})
    const crossfadeProgress = motionValue(1)
    let lastUpdate = 0

    function animateProgress(to: number) {
        animate(crossfadeProgress, to, {
            ...(state.lead?.getDefaultTransition() as any),
            onUpdate: () => {
                state.lead?.scheduleRender()
                state.follow?.scheduleRender()
            },
        })
    }

    function updateValues() {
        const { timestamp } = getFrameData()
        if (timestamp === lastUpdate) return
        lastUpdate = timestamp

        const p = crossfadeProgress.get()

        const { follow, lead } = state
        if (!follow || !lead) return
        if (follow.isPresenceRoot || lead.isPresenceRoot) {
            const followTargetOpacity = follow.getStaticValue("opacity") ?? 1
            const leadTargetOpacity = lead.getStaticValue("opacity") ?? 1

            // TODO Make this configurable by crossfade
            followValues.values.opacity = mix(
                followTargetOpacity as number,
                0,
                easeCrossfadeOut(p)
            )
            leadValues.values.opacity = mix(
                0,
                leadTargetOpacity as number,
                easeCrossfadeIn(p)
            )
        }

        // TODO handle percentages and individual border radius
        followValues.values.borderRadius = leadValues.values.borderRadius = mix(
            (follow.getStaticValue("borderRadius") as number) ?? 0,
            (lead.getStaticValue("borderRadius") as number) ?? 0,
            p
        )

        followValues.projection = lead.getProjection()
        leadValues.projection = lead.getProjection()
    }

    return {
        crossfadeFromLead() {
            animateProgress(0)
            followValues = createVisualState({})
            leadValues = createVisualState({})
        },
        crossfadeToLead() {
            crossfadeProgress.set(1 - crossfadeProgress.get())
            animateProgress(1)
            followValues = createVisualState({})
            leadValues = createVisualState({})
        },
        isCrossfading() {
            return Boolean(
                state.lead && state.follow && crossfadeProgress.get() !== 1
            )
        },
        getValues(element) {
            updateValues()
            return element === state.lead ? leadValues : followValues
        },
        reset() {
            crossfadeProgress.set(1)
        },
    }
}

interface StackState {
    lead?: VisualElement
    follow?: VisualElement
    leadIsExiting: boolean
}

export function layoutStack(): LayoutStack {
    const stack = new Set<VisualElement>()
    const state: StackState = { leadIsExiting: false }
    let prevState: StackState = { ...state }

    let prevViewportBox: AxisBox2D | undefined
    let crossfadeState = createCrossfadeState(state)
    let needsCrossfadeAnimation = false

    function getFollowViewportBox() {
        return state.follow ? state.follow.prevViewportBox : prevViewportBox
    }

    function getFollowLayout() {
        return state.follow?.getLayoutState().layout
    }

    return {
        add(element) {
            element.setCrossfadeState(crossfadeState)
            stack.add(element)
            if (!state.lead) state.lead = element
        },
        remove(element) {
            stack.delete(element)
        },
        getLead() {
            return state.lead
        },
        updateSnapshot() {
            prevViewportBox = state.lead?.prevViewportBox
        },
        clearSnapshot() {
            prevViewportBox = undefined
        },
        // TODO We might not need this
        updateLeadAndFollow() {
            prevState = { ...state }

            let lead: VisualElement | undefined
            let follow: VisualElement | undefined
            const order = Array.from(stack)
            for (let i = order.length; i--; i >= 0) {
                const element = order[i]
                if (lead) follow ??= element
                lead ??= element
                if (lead && follow) break
            }
            state.lead = lead
            state.follow = follow
            state.leadIsExiting = state.lead?.presence === Presence.Exiting
            state.lead?.getLayoutId() === "hsl(0, 100%, 50%)" &&
                console.log(
                    state.lead?.getLayoutId(),
                    !!state.follow,
                    !!state.lead
                )
            if (
                prevState.lead !== state.lead ||
                prevState.leadIsExiting !== state.leadIsExiting
            ) {
                if (!state.follow) {
                    crossfadeState.reset()
                } else {
                    needsCrossfadeAnimation = true
                }
            }
        },
        animate(child, shouldCrossfade = false) {
            if (child === state.lead) {
                if (shouldCrossfade) {
                    child.pointTo(state.lead)
                } else {
                    child.setVisibility(true)
                }

                const config: SharedLayoutAnimationConfig = {}
                if (child.presence === Presence.Entering) {
                    config.originBox = getFollowViewportBox()
                } else if (child.presence === Presence.Exiting) {
                    config.targetBox = getFollowLayout()
                }

                if (needsCrossfadeAnimation) {
                    needsCrossfadeAnimation = false
                    child.presence === Presence.Entering
                        ? crossfadeState.crossfadeToLead()
                        : crossfadeState.crossfadeFromLead()
                }

                child.notifyLayoutReady(config)
            } else {
                if (shouldCrossfade) {
                    state.lead && child.pointTo(state.lead)
                } else {
                    child.setVisibility(false)
                }
            }
        },
    }
}

const easeCrossfadeIn = compress(0, 0.5, circOut)
const easeCrossfadeOut = compress(0.5, 0.95, linear)

function compress(
    min: number,
    max: number,
    easing: EasingFunction
): EasingFunction {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(progress(min, max, p))
    }
}
// export class LayoutStack {
//     order: VisualElement[] = []

//     lead?: VisualElement | undefined
//     follow?: VisualElement | undefined

//     prevLead?: VisualElement | undefined
//     prevFollow?: VisualElement | undefined

//     snapshot?: Snapshot

//     getLead() {
//         return this.lead
//     }

//     updateLeadAndFollow() {
//         this.prevLead = this.lead
//         this.prevFollow = this.follow

//         const [lead, follow] = findLeadAndFollow(this.order, [
//             this.lead,
//             this.follow,
//         ])

//         this.lead = lead
//         this.follow = follow
//     }

//     // updateSnapshot() {
//     //     if (!this.lead) return

//     //     const snapshot: Snapshot = {
//     //         boundingBox: this.lead.getProjection().target,
//     //         latestMotionValues: {},
//     //     }

//     //     this.lead.forEachValue((value, key) => {
//     //         const latest = value.get()
//     //         if (!isTransformProp(latest)) {
//     //             snapshot.latestMotionValues[key] = latest
//     //         }
//     //     })

//     //     const dragControls = elementDragControls.get(this.lead)
//     //     if (dragControls && dragControls.isDragging) {
//     //         snapshot.isDragging = true
//     //         snapshot.cursorProgress = dragControls.cursorProgress
//     //     }

//     //     this.snapshot = snapshot
//     // }

//     isLeadPresent() {
//         return this.lead && this.lead?.presence !== Presence.Exiting
//     }
// }
