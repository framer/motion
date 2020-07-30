/**
 *
 */
// export class SubscriptionManager<Handler> {
//     private subscriptions: Handler[] = []
//     private numSubscriptions: number = 0

//     private updateSubscriptionCount() {
//         this.numSubscriptions = this.subscriptions.length
//     }

//     private findHandlerIndex(handler: Handler) {
//         return this.subscriptions.findIndex(h => h === handler)
//     }

//     subscribe(handler: Handler) {
//         let i = this.findHandlerIndex(handler)
//         i === -1 && this.subscriptions.push(handler)
//         this.updateSubscriptionCount()

//         return () => {
//             i = this.findHandlerIndex(handler)
//             i !== -1 && this.subscriptions.splice(i, 1)
//             this.updateSubscriptionCount()
//         }
//     }

//     notify(a?: any, b?: any, c?: any) {
//         if (!this.numSubscriptions) return

//         for (let i = 0; i < this.numSubscriptions; i++) {
//             ;(this.subscriptions[i] as any)(a, b, c)
//         }
//     }

//     clear() {
//         this.subscriptions.length = 0
//         this.updateSubscriptionCount()
//     }
// }

export class SubscriptionManager<Handler> {
    private subscriptions = new Set<Handler>()
    private numSubscriptions = 0

    private updateSubscriptionCount() {
        this.numSubscriptions = this.subscriptions.size
    }

    subscribe(handler: Handler) {
        this.subscriptions.add(handler)
        this.updateSubscriptionCount()

        return () => {
            this.subscriptions.delete(handler)
            this.updateSubscriptionCount()
        }
    }

    notify(a?: any, b?: any, c?: any) {
        if (!this.numSubscriptions) return

        for (const handler of this.subscriptions) {
            ;(handler as any)(a, b, c)
        }
    }

    clear() {
        this.subscriptions.clear()
        this.updateSubscriptionCount()
    }
}
