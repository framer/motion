type GenericHandler = (...args: any) => void

export interface SubscriptionManager<Handler extends GenericHandler> {
    add(handler: Handler): () => void
    notify(
        a?: Parameters<Handler>[0],
        b?: Parameters<Handler>[1],
        c?: Parameters<Handler>[2]
    ): void
    getSize(): number
    clear(): void
}

export function subscriptionManager<
    Handler extends GenericHandler
>(): SubscriptionManager<Handler> {
    const subscriptions = new Set<Handler>()

    return {
        add(handler) {
            subscriptions.add(handler)
            return () => subscriptions.delete(handler)
        },

        notify(a, b, c) {
            if (!subscriptions.size) return
            for (const handler of subscriptions) {
                handler(a, b, c)
            }
        },

        getSize: () => subscriptions.size,

        clear() {
            subscriptions.clear()
        },
    }
}
