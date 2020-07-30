export class SubscriptionManager<Handler> {
    private subscriptions: Handler[] = []
    private numSubscriptions: number = 0

    private updateSubscriptionCount() {
        this.numSubscriptions = this.subscriptions.length
    }

    private findHandlerIndex(handler: Handler) {
        return this.subscriptions.findIndex(h => h === handler)
    }

    private containsHandler(handler: Handler) {
        const i = this.findHandlerIndex(handler)
        return i !== -1
    }

    subscribe(handler: Handler) {
        !this.containsHandler(handler) && this.subscriptions.push(handler)
        this.updateSubscriptionCount()

        return () => {
            const i = this.findHandlerIndex(handler)
            i !== -1 && this.subscriptions.splice(i, 1)
            this.updateSubscriptionCount()
        }
    }

    notify(a?: any, b?: any, c?: any) {
        if (!this.numSubscriptions) return

        for (let i = 0; i < this.numSubscriptions; i++) {
            ;(this.subscriptions[i] as any)(a, b, c)
        }
    }

    clear() {
        this.subscriptions = []
        this.updateSubscriptionCount()
    }
}
