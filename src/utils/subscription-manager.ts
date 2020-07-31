type GenericHandler = (...args: any) => void

/**
 * A generic subscription manager.
 */
export class SubscriptionManager<Handler extends GenericHandler> {
    private subscriptions = new Set<Handler>()

    add(handler: Handler) {
        this.subscriptions.add(handler)
        return () => void this.subscriptions.delete(handler)
    }

    notify(
        /**
         * Using ...args would be preferable but it's array creation and this
         * might be fired every frame.
         */
        _a?: Parameters<Handler>[0],
        _b?: Parameters<Handler>[1],
        _c?: Parameters<Handler>[2]
    ) {
        if (!this.subscriptions.size) return
        for (const handler of this.subscriptions) {
            handler.call(arguments)
        }
    }

    clear() {
        this.subscriptions.clear()
    }
}
