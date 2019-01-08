import { Poses, PoseResolver, PoseTransition, PoseDefinition } from "../types"
import { AnimationControls } from "../motion/utils/use-animation-controls"

export type AnimationDefinition = [PoseResolver] | [PoseDefinition, PoseTransition] | [PoseDefinition] | [string]

export class AnimationManager {
    private hasMounted = false
    private pendingAnimations: AnimationDefinition[] = []
    private subscribers = new Set<AnimationControls>()
    private poses: Poses = {}

    setPoses(poses: Poses) {
        this.poses = poses
        this.subscribers.forEach(subscriber => subscriber.setPoses(poses))
    }

    subscribe(subscriber: AnimationControls) {
        this.subscribers.add(subscriber)

        if (this.poses) subscriber.setPoses(this.poses)

        return () => this.subscribers.delete(subscriber)
    }

    start(...animationDefinition: AnimationDefinition): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []
            this.subscribers.forEach(controls => {
                const animation = controls.start(...animationDefinition)
                animations.push(animation)
            })

            return Promise.all(animations)
        } else {
            this.pendingAnimations.push(animationDefinition)
            return Promise.resolve() // Will this cause problems?
        }
    }

    stop() {
        this.subscribers.forEach(subscriber => subscriber.stop())
    }

    mount() {
        this.hasMounted = true
        this.pendingAnimations.forEach(animationDefinition => this.start(...animationDefinition))
    }

    unmount() {
        this.hasMounted = false
        this.stop()
    }
}
