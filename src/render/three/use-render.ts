import { createElement } from "react"
import { RenderComponent } from "../.."
import { ThreeMotionProps, ThreeRenderState } from "./types"
import { filterProps } from "../dom/utils/filter-props"
import { MeshProps, Object3DNode } from "@react-three/fiber"
import { useHover } from "./gestures/use-hover"
import { useTap } from "./gestures/use-tap"

export const useRender: RenderComponent<
    Object3DNode<any, any>,
    ThreeRenderState
> = (
    Component,
    props: ThreeMotionProps & MeshProps,
    _projectionId,
    ref,
    _state,
    isStatic,
    visualElement
) => {
    return createElement<any>(Component, {
        ref,
        ...filterProps(props, false, false),
        onUpdate: props.onInstanceUpdate,
        ...useHover(isStatic, props, visualElement),
        ...useTap(isStatic, props, visualElement),
    } as any)
}
