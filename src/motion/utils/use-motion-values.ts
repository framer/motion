import { MotionValue } from "../../value"
import { createStylerFactory, Styler } from "stylefire"
import { OnUpdate, MotionProps, TransformTemplate } from "../types"
import { useConstant } from "../../utils/use-constant"
import { isMotionValue } from "../../value/utils/is-motion-value"

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

    delete(key: string) {
        this.values.delete(key)
        const unsubscribe = this.unsubscribers.get(key)
        unsubscribe && unsubscribe()
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

        if (this.unsubscribers.has(key)) {
            this.unsubscribers.get(key)!()
        }

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

const specialMotionValueProps = new Set(["dragOriginX", "dragOriginY"])

export const useMotionValues = (props: MotionProps) => {
    const motionValues = useConstant(() => {
        const map = new MotionValuesMap()

        /**
         * Loop through every prop and add any detected `MotionValue`s. This is SVG-specific
         * code that should be extracted, perhaps considered hollistically with `useMotionStyles`.
         *
         * <motion.circle cx={motionValue(0)} />
         */
        for (const key in props) {
            if (
                isMotionValue(props[key]) &&
                !specialMotionValueProps.has(key)
            ) {
                map.set(key, props[key])
            }
        }

        return map
    })
    motionValues.setOnUpdate(props.onUpdate)
    motionValues.setTransformTemplate(props.transformTemplate)

    return motionValues
}
