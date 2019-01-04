import { Pose, Poses, PoseResolver, PoseTransition, PoseAndTransition } from "../types"
import { AnimationControls } from "../motion/utils/use-animation-controls"

const isPoseResolver = (p: any): p is PoseResolver => typeof p === "function"

export class AnimationManager {
    private hasMounted = false
    private pendingAnimations: Array<PoseResolver | PoseAndTransition> = []
    private subscribers = new Set<AnimationControls>()
    private poses: Poses = {}

    setPoses(poses: Poses) {
        this.poses = poses
    }

    subscribe(subscriber: AnimationControls) {
        this.subscribers.add(subscriber)

        return () => this.subscribers.delete(subscriber)
    }

    start(to: PoseResolver): Promise<any>
    start(to: Pose, options: PoseTransition): Promise<any>
    start(to: Pose | PoseResolver, options: PoseTransition = {}): Promise<any> {
        if (this.hasMounted) {
            const animations: Array<Promise<any>> = []

            this.subscribers.forEach(subscriber => {
                const animation = subscriber.start(to, options)
                animations.push(animation)
            })

            return Promise.all(animations)
        } else {
            const definition = isPoseResolver(to) ? to : ([to, options] as PoseAndTransition)
            this.pendingAnimations.push(definition)
            return Promise.resolve()
        }
    }

    stop() {
        this.subscribers.forEach(subscriber => subscriber.stop())
    }

    mount() {
        this.hasMounted = true
        this.pendingAnimations.map(definition => {
            if (isPoseResolver(definition)) {
                this.start(definition)
            } else {
                const [to, opts] = definition
                this.start(to, opts)
            }
        })
    }

    unmount() {
        this.hasMounted = false
        this.stop()
    }
}
