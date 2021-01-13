import sync from "framesync"
import { pipe } from "popmotion"
import { ResolvedValues } from "../../render/VisualElement/types"
import { SubscriptionManager } from "../../utils/subscription-manager"
import { motionValue, MotionValue } from "../../value"
import { Projection } from "./types"

export function projection() {
    const values = new Map<string, MotionValue>()
    const latest: ResolvedValues = {}

    const valueSubscriptions = new Map<string, () => void>()
    const renderSubscriptions = new SubscriptionManager()

    function subscribeToValue(key: string, value: MotionValue) {
        valueSubscriptions.set(
            key,
            pipe(
                value.onChange((latestValue: string | number) => {
                    latest[key] = latestValue

                    // if we have attached visualelements, maybe make this configurable
                    // sync.update(, false, true) - fire onUpdate listener with latest
                }),
                value.onRenderRequest(() => renderSubscriptions.notify())
            )
        )
    }

    const style: Projection = {
        addValue(key, value) {
            if (style.hasValue(key)) style.removeValue(key)

            values.set(key, value)
            latest[key] = value.get()
            subscribeToValue(key, value)
        },

        removeValue(key) {
            values.delete(key)
            valueSubscriptions.get(key)?.()
            valueSubscriptions.delete(key)
            delete latest[key]
        },

        hasValue: (key) => values.has(key),

        getValue(key: string, defaultValue?: string | number) {
            let value = values.get(key)

            if (value === undefined && defaultValue !== undefined) {
                value = motionValue(defaultValue)
                style.addValue(key, value)
            }

            return value as MotionValue
        },
    }

    return style
}
