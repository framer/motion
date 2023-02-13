import { AnimationType } from "../../../render/utils/types"
import { VisualElementProps } from "../../../render/VisualElement"
import { noop } from "../../../utils/noop"
import { Feature } from "../Feature"

let id = 0

export class ExitAnimationFeature extends Feature<unknown> {
    private id: number = id++

    private removePresenceSubscription: Function = noop

    update(
        {
            onExitComplete,
            isPresent,
            custom,
            presenceCustomData,
        }: VisualElementProps,
        prevProps: VisualElementProps = {}
    ) {
        if (!this.node.animationState || isPresent === prevProps.isPresent) {
            return
        }

        const exitAnimation = this.node.animationState.setActive(
            AnimationType.Exit,
            !isPresent,
            { custom: presenceCustomData ?? custom }
        )

        if (onExitComplete && !isPresent) {
            exitAnimation.then(() => onExitComplete(this.id))
        }
    }

    mount() {
        const { registerPresence } = this.node.getProps()

        if (registerPresence) {
            this.removePresenceSubscription = registerPresence(this.id)
        }
    }

    unmount() {
        if (this.removePresenceSubscription) {
            this.removePresenceSubscription()
        }
    }
}
