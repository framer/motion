import { useMemo, useEffect, RefObject } from "react"
import { MotionValue } from "../../value"
import styler, { createStylerFactory, Styler } from "stylefire"
import { invariant } from "hey-listen"
import { OnUpdate, MotionProps } from "motion/types"

// Creating a styler factory for the `onUpdate` prop allows all values
// to fire and the `onUpdate` prop will only fire once per frame
const updateStyler = createStylerFactory({
    onRead: () => null,
    onRender: (state, { onUpdate }) => onUpdate(state),
})

export class MotionValuesMap {
    private hasMounted = false
    private styler: Styler
    private onUpdate?: Styler
    private shouldRender: boolean = true
    private values = new Map<string, MotionValue>()
    private unsubscribers = new Map<string, () => void>()

    has(key: string) {
        return this.values.has(key)
    }

    set(key: string, value: MotionValue) {
        this.values.set(key, value)

        if (this.hasMounted) this.bindValueToStyler(key, value)
    }

    get<Value>(key: string): MotionValue<Value> | undefined
    get<Value>(key: string, defaultValue: Value): MotionValue<Value>
    get<Value>(
        key: string,
        defaultValue?: Value
    ): MotionValue<Value> | undefined {
        let value = this.values.get(key)
        if (value === undefined && defaultValue !== undefined) {
            value = new MotionValue(defaultValue)
            this.set(key, value)
        }
        return value
    }

    forEach(callback: (value: MotionValue, key: string) => void) {
        return this.values.forEach(callback)
    }

    bindValueToStyler(key: string, value: MotionValue) {
        const update = (v: any) => {
            if (this.shouldRender) {
                this.styler.set(key, v)
            }
            if (this.onUpdate) {
                this.onUpdate.set(key, v)
            }
        }
        const unsubscribe = value.addRenderSubscription(update)
        this.unsubscribers.set(key, unsubscribe)
    }

    setOnUpdate(onUpdate?: OnUpdate) {
        this.onUpdate = undefined
        if (onUpdate) {
            this.onUpdate = updateStyler({ onUpdate })
        }
    }

    setShouldRender(render: boolean) {
        this.shouldRender = render
        // TODO: Maybe force a render if this goes false -> true
    }

    mount(element: Element) {
        this.hasMounted = true
        this.styler = styler(element, { preparseOutput: false })
        this.values.forEach((value, key) => this.bindValueToStyler(key, value))
    }

    unmount() {
        this.values.forEach((_value, key) => {
            const unsubscribe = this.unsubscribers.get(key)
            unsubscribe && unsubscribe()
        })
    }
}

export const useMotionValues = (
    ref: RefObject<Element>,
    { onUpdate, render = true }: MotionProps
) => {
    const motionValues = useMemo(() => new MotionValuesMap(), [])
    motionValues.setOnUpdate(onUpdate)
    motionValues.setShouldRender(render)

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
