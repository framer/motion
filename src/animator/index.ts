export class Animator {
    private hasMounted = false
    private pendingAnimations = []
    private subscribers = []
    private poses = {}

    setPoses(poses) {
        this.poses = poses
    }

    getPose(poseKey: string) {
        return this.poses[poseKey]
    }

    subscribe(sub) {
        this.subscribers.push(sub)
    }

    start(def) {
        if (this.hasMounted) {
            const animations = []
            this.subscribers.forEach(sub => {
                if (typeof def === "string") {
                    def = this.poses[def]
                }
                const animation = sub.start(def)
                animations.push(animation)
            })
            return Promise.all(animations)
        } else {
            this.pendingAnimations.push(def)
            return Promise.resolve()
        }
    }

    stop() {
        this.subscribers.forEach(sub => sub.stop())
    }

    mount() {
        this.hasMounted = true
        this.pendingAnimations.map(def => this.start(def))
    }

    unmount() {
        this.hasMounted = false
        this.stop()
    }
}
