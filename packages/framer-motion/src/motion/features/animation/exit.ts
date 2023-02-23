import { Feature } from "../Feature"

let id = 0

export class ExitAnimationFeature extends Feature<unknown> {
    private id: number = id++

    update() {
        if (!this.node.presenceContext) return

        const { isPresent, onExitComplete, custom } = this.node.presenceContext
        const { isPresent: prevIsPresent } = this.node.prevPresenceContext || {}

        if (!this.node.animationState || isPresent === prevIsPresent) {
            return
        }

        const exitAnimation = this.node.animationState.setActive(
            "exit",
            !isPresent,
            { custom: custom ?? this.node.getProps().custom }
        )

        if (onExitComplete && !isPresent) {
            exitAnimation.then(() => onExitComplete(this.id))
        }
    }

    mount() {
        const { register } = this.node.presenceContext || {}

        if (register) {
            this.unmount = register(this.id)
        }
    }

    unmount() {}
}
