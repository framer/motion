type GenericHandler = (...args: any) => void

export function subscriptionManager<Handler extends GenericHandler>() {
    const subscriptions = new Set<Handler>()

    return {
        add(handler: Handler) {
            subscriptions.add(handler)
            return () => subscriptions.delete(handler)
        },

        notify(
            /**
             * Using ...args would be preferable but it's array creation and this
             * might be fired every frame.
             */
            a?: Parameters<Handler>[0],
            b?: Parameters<Handler>[1],
            c?: Parameters<Handler>[2]
        ) {
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
