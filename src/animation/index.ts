import { Variants, Variant, Transition } from "../types"
import { AnimationControls } from "../motion"

export class AnimationManager {
    private hasMounted = false
    private defaultTransition: Transition
    private pendingAnimations: Array<Variant | string> = []
    private componentControls = new Set<AnimationControls>()
    private variants: Variants = {}

    setVariants(variants: Variants) {
        this.variants = variants
        this.componentControls.forEach(controls => controls.setVariants(variants))
    }

    setDefaultTransition(transition: Transition) {
        this.defaultTransition = transition
        this.componentControls.forEach(controls => controls.setDefaultTransition(transition))
    }

    subscribe(controls: AnimationControls) {
        this.componentControls.add(controls)
        if (this.variants) controls.setVariants(this.variants)
        if (this.defaultTransition) controls.setDefaultTransition(this.defaultTransition)

        return () => this.componentControls.delete(controls)
    }

    start(definition: Variant | string): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []
            this.componentControls.forEach(controls => {
                const animation = controls.start(definition)
                animations.push(animation)
            })

            return Promise.all(animations)
        } else {
            this.pendingAnimations.push(definition)
            return Promise.resolve() // Will this cause problems?
        }
    }

    stop() {
        this.componentControls.forEach(controls => controls.stop())
    }

    mount() {
        this.hasMounted = true
        this.pendingAnimations.forEach(variant => this.start(variant))
    }

    unmount() {
        this.hasMounted = false
        this.stop()
    }
}
