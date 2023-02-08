import { AnimationType } from "../../render/utils/types"
import { MotionNodeProps } from "../../render/VisualElement"
import { Feature } from "./Feature"

export class ExitAnimationFeature extends Feature<unknown> {
    update(
        {
            safeToRemove,
            isPresent,
            custom,
            presenceCustomData,
        }: MotionNodeProps,
        prevProps: MotionNodeProps = {}
    ) {
        if (!this.node.animationState || isPresent === prevProps.isPresent) {
            return
        }

        this.node.animationState
            .setActive(AnimationType.Exit, !isPresent, {
                custom: presenceCustomData ?? custom,
            })
            .then(safeToRemove)
    }

    mount() {}

    unmount() {}
}
