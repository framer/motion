import { createElement } from "react"
import { RenderComponent } from "../.."
import { ThreeRenderState } from "./types"
import { filterProps } from "../dom/utils/filter-props"
import { AnimationType } from "../utils/types"

export const useRender: RenderComponent<any, ThreeRenderState> = (
    Component,
    props,
    _projectionId,
    ref,
    state,
    isStatic,
    visualElement
) => {
    const forwardedProps = filterProps(props, false, false)

    const elementProps = { ref, ...forwardedProps } as any

    if (!isStatic) {
        if (props.whileTap) {
            elementProps.onPointerDown = (event) => {
                visualElement.animationState?.setActive(AnimationType.Tap, true)
                props.onPointerDown?.(event)
            }
            elementProps.onPointerUp = (event) => {
                visualElement.animationState?.setActive(
                    AnimationType.Tap,
                    false
                )
                props.onPointerUp?.(event)
            }
        }

        if (props.whileHover) {
            elementProps.onPointerOver = (event) => {
                visualElement.animationState?.setActive(
                    AnimationType.Hover,
                    true
                )
                props.onPointerOver?.(event)
            }
            elementProps.onPointerOut = (event) => {
                visualElement.animationState?.setActive(
                    AnimationType.Hover,
                    false
                )
                props.onPointerOut?.(event)
            }
        }
    }

    return createElement<any>(Component, elementProps)
}
