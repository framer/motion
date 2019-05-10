import { forwardRef, useEffect, memo } from "react"
import { MotionValue } from "../../value"
import styler, { createStylerFactory, Styler } from "stylefire"
import { OnUpdate, MotionProps, TransformTemplate } from "../types"
import { invariant } from "hey-listen"
import { useConstant } from "../../utils/use-constant"

// Creating a styler factory for the `onUpdate` prop allows all values
// to fire and the `onUpdate` prop will only fire once per frame
const updateStyler = createStylerFactory({
    onRead: () => null,
    onRender: (state, { onUpdate }) => onUpdate(state),
})

type Output = (
    key: string,
    value: string | number | TransformTemplate | undefined
) => void

export class MotionValuesMap {
    private hasMounted = false
    private transformTemplate: TransformTemplate | undefined
    private onUpdate?: Styler
    private values = new Map<string, MotionValue>()
    private unsubscribers = new Map<string, () => void>()
    private output: Output

    has(key: string) {
        return this.values.has(key)
    }

    set(key: string, value: MotionValue) {
        this.values.set(key, value)

        if (this.hasMounted) {
            this.bindValueToOutput(key, value)
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

    private bindValueToOutput(key: string, value: MotionValue) {
        const onRender = (v: any) => this.output && this.output(key, v)
        const unsubscribeOnRender = value.onRenderRequest(onRender)

        const onChange = (v: any) => {
            this.onUpdate && this.onUpdate.set(key, v)
        }
        const unsubscribeOnChange = value.onChange(onChange)

        this.unsubscribers.set(key, () => {
            unsubscribeOnRender()
            unsubscribeOnChange()
        })
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
        if (this.output) {
            this.output("transform", this.transformTemplate)
        }
    }

    mount(output?: Output) {
        this.hasMounted = true

        if (output) this.output = output
        this.values.forEach((value, key) => this.bindValueToOutput(key, value))
        this.updateTransformTemplate()
    }

    unmount() {
        this.values.forEach((_value, key) => {
            const unsubscribe = this.unsubscribers.get(key)
            unsubscribe && unsubscribe()
        })
    }
}

export const useMotionValues = ({
    onUpdate,
    transformTemplate,
}: MotionProps) => {
    const motionValues = useConstant(() => new MotionValuesMap())
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
    { values, isStatic }: { values: MotionValuesMap; isStatic: boolean },
    ref: React.RefObject<Element>
) => {
    useEffect(() => {
        invariant(
            ref.current instanceof Element,
            "No `ref` found. Ensure components created with `motion.custom` forward refs using `React.forwardRef`"
        )

        const domStyler = styler(ref.current as Element, {
            preparseOutput: false,
            enableHardwareAcceleration: !isStatic,
        })

        values.mount((key, value) => domStyler.set(key, value))

        return () => values.unmount()
    }, [])

    return null
}

export const MountMotionValues = memo(forwardRef(MountMotionValuesComponent))
