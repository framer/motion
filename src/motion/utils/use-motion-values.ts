import { forwardRef, useEffect, useMemo, memo } from "react"
import { MotionValue } from "../../value"
import styler, { createStylerFactory, Styler } from "stylefire"
import { OnUpdate, MotionProps, TransformTemplate } from "../types"
import { invariant } from "hey-listen"

// Creating a styler factory for the `onUpdate` prop allows all values
// to fire and the `onUpdate` prop will only fire once per frame
const updateStyler = createStylerFactory({
    onRead: () => null,
    onRender: (state, { onUpdate }) => onUpdate(state),
})

export class MotionValuesMap {
    private hasMounted = false
    private styler: Styler
    private transformTemplate: TransformTemplate | undefined
    private onUpdate?: Styler
    private values = new Map<string, MotionValue>()
    private unsubscribers = new Map<string, () => void>()
    private isStatic: boolean

    constructor(isStatic: boolean) {
        this.isStatic = isStatic
    }

    has(key: string) {
        return this.values.has(key)
    }

    set(key: string, value: MotionValue) {
        this.values.set(key, value)

        if (this.hasMounted) {
            this.bindValueToStyler(key, value)
        }
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
            // If this is a custom value, resolve it and then set the return value
            this.styler.set(key, v)

            // If these have been changed by a custom value, add those to onUpdate
            if (this.onUpdate) {
                this.onUpdate.set(key, v)
            }
        }

        const unsubscribe = value.onRenderRequest(update)
        this.unsubscribers.set(key, unsubscribe)
    }

    setOnUpdate(onUpdate?: OnUpdate) {
        this.onUpdate = undefined
        if (onUpdate) {
            this.onUpdate = updateStyler({ onUpdate })
        }
    }

    setTransformTemplate(transformTemplate?: TransformTemplate | undefined) {
        if (this.transformTemplate !== transformTemplate) {
            this.transformTemplate = transformTemplate
            this.updateTransformTemplate()
        }
    }

    getTransformTemplate() {
        return this.transformTemplate
    }

    updateTransformTemplate() {
        if (this.styler) {
            this.styler.set("transform", this.transformTemplate)
        }
    }

    mount(element: Element) {
        this.hasMounted = true
        this.styler = styler(element, {
            preparseOutput: false,
            enableHardwareAcceleration: !this.isStatic,
        })
        this.values.forEach((value, key) => this.bindValueToStyler(key, value))
        this.updateTransformTemplate()
    }

    unmount() {
        this.values.forEach((_value, key) => {
            const unsubscribe = this.unsubscribers.get(key)
            unsubscribe && unsubscribe()
        })
    }
}

export const useMotionValues = (
    { onUpdate, transformTemplate }: MotionProps,
    isStatic: boolean
) => {
    const motionValues = useMemo(() => new MotionValuesMap(isStatic), [])
    motionValues.setOnUpdate(onUpdate)
    motionValues.setTransformTemplate(transformTemplate)

    return motionValues
}

/**
 * `useEffect` gets resolved bottom-up. We defer some optional functionality to child
 * components, so to ensure everything runs correctly we export the ref-binding logic
 * to a new component rather than in `useMotionValues`.
 */
const MountMotionValuesComponent = (
    { values }: { values: MotionValuesMap },
    ref: React.RefObject<Element>
) => {
    useEffect(() => {
        invariant(
            ref.current instanceof Element,
            "No `ref` found. Ensure components created with `motion.custom` forward refs using `React.forwardRef`"
        )

        values.mount(ref.current as Element)

        return () => values.unmount()
    })

    return null
}

export const MountMotionValues = memo(forwardRef(MountMotionValuesComponent))
