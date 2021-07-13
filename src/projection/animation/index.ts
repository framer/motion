import { mix } from "popmotion"
import { animate } from "../../animation/animate"
import { Transition } from "../../types"
import { createDelta } from "../geometry/models"
import { AxisDelta, Delta } from "../geometry/types"
import { IProjectionNode } from "../node/types"

export function mixAxisDelta(output: AxisDelta, delta: AxisDelta, p: number) {
    output.translate = mix(delta.translate, 0, p)
    output.scale = mix(delta.scale, 1, p)
    output.origin = delta.origin
    output.originPoint = delta.originPoint
}

/**
 * TODO: We could add proper velocity transfer by tracking it on the target box
 */
export function animateDelta(
    node: IProjectionNode,
    delta: Delta,
    transition: Transition
) {
    const targetDelta = createDelta()

    const onUpdate = (progress: number) => {
        const p = progress / 1000

        mixAxisDelta(targetDelta.x, delta.x, p)
        mixAxisDelta(targetDelta.y, delta.y, p)

        node.setTargetDelta(targetDelta)
    }

    const animation = animate(0, 1000, {
        ...(transition as any),
        onUpdate,
    })

    return animation
}
