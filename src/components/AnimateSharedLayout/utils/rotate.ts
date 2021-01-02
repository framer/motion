import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement"
import { transformAxes } from "../../../render/dom/utils/transform"

export function resetRotate(child: HTMLVisualElement) {
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
        if (!child.hasValue(key) || child.latest[key] === 0) continue

        hasRotate = true

        // Record the rotation and then temporarily set it to 0
        resetValues[key] = child.latest[key]
        child.latest[key] = 0
    }

    // If there's no rotation values, we don't need to do any more.
    if (!hasRotate) return

    // Force a render of this element to apply the transform with all rotations
    // set to 0.
    child.render()

    // Put back all the values we reset
    for (const key in resetValues) {
        child.latest[key] = resetValues[key]
    }

    // Schedule a render for the next frame. This ensures we won't visually
    // see the element with the reset rotate value applied.
    child.scheduleRender()
}
