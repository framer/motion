import { MotionValue } from "../../value"
import { OnUpdate, MotionProps } from "../types"
import { useConstant } from "../../utils/use-constant"
import { isMotionValue } from "../../value/utils/is-motion-value"
import sync from "framesync"

type Output = (key: string, value: string | number | undefined) => void

export class MotionValuesMap {
    private hasMounted = false
    private onUpdate?: (key: string, value: string | number) => void
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
            this.onUpdate && this.onUpdate(key, v)
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
            this.onUpdate = batchUpdate(onUpdate)
        }
    }

    mount(output?: Output) {
        this.hasMounted = true

        if (output) this.output = output
        this.values.forEach((value, key) => this.bindValueToOutput(key, value))
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

    return motionValues
}

function batchUpdate(update: OnUpdate) {
    let shouldUpdate = false
    const values: { [key: string]: string | number } = {}

    const updateValues = () => update(values)

    return (key: string, value: string | number) => {
        values[key] = value

        if (!shouldUpdate) {
            shouldUpdate = true
            sync.render(updateValues)
        }
    }
}
