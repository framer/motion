import { MotionProps } from "../types"
import { useDrag } from "../../behaviours/use-drag"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"

export const Drag: FunctionalComponentDefinition = {
    key: "drag",
    shouldRender: (props: MotionProps) => !!props.drag,
    Component: makeRenderlessComponent(
        ({ nativeElement, values, controls, ...props }: FunctionalProps) => {
            return useDrag(props, nativeElement, values, controls)
        }
    ),
}
