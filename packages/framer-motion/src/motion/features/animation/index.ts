import { isAnimationControls } from "../../../animation/utils/is-animation-controls"
import { createAnimationState } from "../../../render/utils/animation-state"
import { VisualElement } from "../../../render/VisualElement"
import { Feature } from "../Feature"

export class AnimationFeature extends Feature<unknown> {
    /**
     * We dynamically generate the AnimationState manager as it contains a reference
     * to the underlying animation library. We only want to load that if we load this,
     * so people can optionally code split it out using the `m` component.
     */
    constructor(node: VisualElement) {
        super(node)
        node.animationState ||= createAnimationState(node)
    }

    updateAnimationControlsSubscription() {
        const { animate } = this.node.getProps()
        this.unmount()
        if (isAnimationControls(animate)) {
            this.unmount = animate.subscribe(this.node)
        }
    }

    /**
     * Subscribe any provided AnimationControls to the component's VisualElement
     */
    mount() {
        this.updateAnimationControlsSubscription()
    }

    update() {
        const { animate } = this.node.getProps()
        const { animate: prevAnimate } = this.node.prevProps || {}
        if (animate !== prevAnimate) {
            this.updateAnimationControlsSubscription()
        }
    }

    unmount() {}
}
