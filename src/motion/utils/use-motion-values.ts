import { useMemo, useEffect, RefObject } from "react"
import { MotionValue } from "value"
import styler, { Styler } from "stylefire"
import { invariant } from "hey-listen"

export class MotionValuesMap {
    private hasMounted = false
    private styler: Styler
    private values = new Map<string, MotionValue>()
    private unsubscribers = new Map<string, () => void>()

    has(key: string) {
        return this.values.has(key)
    }

    set(key: string, value: MotionValue) {
        this.values.set(key, value)

        if (this.hasMounted) this.bindValueToStyler(key, value)
    }

    get(key: string) {
        return this.values.get(key)
    }

    forEach(callback: (value: MotionValue, key: string) => void) {
        return this.values.forEach(callback)
    }

    bindValueToStyler(key: string, value: MotionValue) {
        const update = (v: any) => this.styler.set(key, v)
        const unsubscribe = value.addRenderSubscription(update)
        this.unsubscribers.set(key, unsubscribe)
    }

    mount(element: Element) {
        this.hasMounted = true
        this.styler = styler(element)
        this.values.forEach((value, key) => this.bindValueToStyler(key, value))
    }

    unmount() {
        this.values.forEach((_value, key) => {
            const unsubscribe = this.unsubscribers.get(key)
            unsubscribe && unsubscribe()
        })
    }
}

export const useMotionValues = (ref: RefObject<Element>) => {
    const motionValues = useMemo(() => new MotionValuesMap(), [])

    useEffect(() => {
        invariant(
            ref.current instanceof Element,
            "No `ref` found. Ensure components created with `motion.custom` forward refs using `React.forwardRef`"
        )

        motionValues.mount(ref.current as Element)

        return () => motionValues.unmount()
    })

    return motionValues
}
