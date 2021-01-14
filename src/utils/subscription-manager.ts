type GenericHandler = (...args: any) => void

// export function subscriptionManager<Handler extends GenericHandler>() {
//     const subscriptions = new Set<Handler>()

//     return {
//         add(handler: Handler) {
//             subscriptions.add(handler)
//             return () => void subscriptions.delete(handler)
//         },

//         notify(
//             /**
//              * Using ...args would be preferable but it's array creation and this
//              * might be fired every frame.
//              */
//             a?: Parameters<Handler>[0],
//             b?: Parameters<Handler>[1],
//             c?: Parameters<Handler>[2]
//         ) {
//             if (!subscriptions.size) return
//             for (const handler of subscriptions) {
//                 handler(a, b, c)
//             }
//         },

//         clear() {
//             subscriptions.clear()
//         },
//     }
// }

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
        a?: Parameters<Handler>[0],
        b?: Parameters<Handler>[1],
        c?: Parameters<Handler>[2]
    ) {
        if (!this.subscriptions.size) return
        for (const handler of this.subscriptions) {
            handler(a, b, c)
        }
    }

    clear() {
        this.subscriptions.clear()
    }
}
