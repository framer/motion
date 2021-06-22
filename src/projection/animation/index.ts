import { mix } from "popmotion"
import { animate } from "../../animation/animate"
import { Transition } from "../../types"
import { createDelta } from "../geometry/models"
import { AxisDelta, Delta } from "../geometry/types"
import { IProjectionNode } from "../node/types"

export type AnimationDeltaType = "position" | "size" | true

export function mixAxisDelta(
    output: AxisDelta,
    delta: AxisDelta,
    p: number,
    type: AnimationDeltaType = true
) {
    output.translate = mix(delta.translate, 0, type !== "size" ? p : 1)
    output.scale = mix(delta.scale, 1, type !== "position" ? p : 1)
    output.origin = delta.origin
    output.originPoint = delta.originPoint
}

/**
 * TODO: We could add proper velocity transfer by tracking it on the target box
 */
export function animateDelta(
    node: IProjectionNode,
    delta: Delta,
    transition: Transition,
    type: AnimationDeltaType = true
) {
    const targetDelta = createDelta()

    const onUpdate = (progress: number) => {
        const p = progress / 1000

        mixAxisDelta(targetDelta.x, delta.x, p, type)
        mixAxisDelta(targetDelta.y, delta.y, p, type)

        node.setTargetDelta(targetDelta)
    }

    const animation = animate(0, 1000, {
        ...(transition as any),
        onUpdate,
    })

    return animation
}
