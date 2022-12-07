import { appearStoreId } from "./store-id"
import { animateStyle } from "../waapi"
import { NativeAnimationOptions } from "../waapi/types"

export function startAppearAnimation(
    element: HTMLElement,
    name: string,
    keyframes: string[] | number[],
    options: NativeAnimationOptions
): Animation | undefined {
    window.MotionAppearAnimations ||= new Map()

    const id = element.dataset.appearId
    const animation = animateStyle(element, name, keyframes, options)

    if (id && animation) {
        window.MotionAppearAnimations.set(appearStoreId(id, name), animation)
    }

    return animation
}
