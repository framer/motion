import { MotionProps } from "../types"
import { useDrag } from "../../behaviours/use-drag"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"

export const Drag: FunctionalComponentDefinition = {
    key: "drag",
    shouldRender: (props: MotionProps) => !!props.drag,
    Component: makeHookComponent(
        ({ innerRef, values, controls, ...props }: FunctionalProps) => {
            return useDrag(props, innerRef, values, controls)
        }
    ),
}
