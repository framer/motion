import { MotionProps } from "../../types"
import { makeRenderlessComponent } from "../../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "../types"
import { useLayoutEffect } from "react"

export const MeasureLayout: MotionFeature = {
    key: "measure-layout",
    shouldRender: (props: MotionProps) => !!props.drag || !!props.exit,
    Component: makeRenderlessComponent(({ visualElement }: FeatureProps) => {
        // TODO: useIsomorphicLayout
        useLayoutEffect(() => {
            visualElement.isLayoutAware && visualElement.updateLayoutBox()
        })
    }),
}
