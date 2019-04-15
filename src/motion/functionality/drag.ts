import { MotionProps } from "../types"
import { useDraggable } from "../../behaviours"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps } from "./types"

export const Drag = {
    test: (props: MotionProps) => !!props.drag,
    component: makeHookComponent(
        ({ innerRef, values, controls, ...props }: FunctionalProps) => {
            return useDraggable(props, innerRef, values, controls)
        }
    ),
}
