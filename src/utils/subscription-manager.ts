import { addUniqueItem, removeItem } from "./array"

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
    const subscriptions: Handler[] = []

    return {
        add(handler) {
            addUniqueItem(subscriptions, handler)
            return () => removeItem(subscriptions, handler)
        },

        notify(a, b, c) {
            const numSubscriptions = subscriptions.length

            if (!numSubscriptions) return

            if (numSubscriptions === 1) {
                /**
                 * If there's only a single handler we can just call it without invoking a loop.
                 */
                subscriptions[0](a, b, c)
            } else {
                for (let i = 0; i < numSubscriptions; i++) {
                    /**
                     * Check whether the handler exists before firing as it's possible
                     * the subscriptions were modified during this loop running.
                     */
                    const handler = subscriptions[i]
                    handler && handler(a, b, c)
                }
            }
        },

        getSize: () => subscriptions.length,

        clear() {
            subscriptions.length = 0
        },
    }
}
