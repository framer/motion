import { Ref } from "react"
import { isRefObject } from "../utils/is-ref-object"
import { MotionValue } from "../value"
import sync, { cancelSync } from "framesync"
import { MotionProps } from "../motion/types"
import { ResolvedValues } from "./types"

export abstract class VisualElement<E = any> {
    // A reference to the parent VisualElement
    protected parent?: VisualElement<E>

    // The actual element
    protected element: E

    // The latest resolved MotionValues
    protected latest: ResolvedValues = {}

    // A map of MotionValues used to animate this element
    private values = new Map<string, MotionValue>()

    // Unsubscription callbacks for each MotionValue
    private valueSubscriptions = new Map<string, () => void>()

    // An optional user-provided React ref
    private externalRef?: Ref<E>

    // A reference to the latest component props
    private props: MotionProps = {}

    // An alias for element to allow VisualElement to be used
    // like a RefObject. This is a temporary measure to work with
    // some existing internal APIs.
    current: E

    // The depth of this VisualElement in the VisualElement tree
    readonly depth: number

    constructor(parent?: VisualElement<E>, ref?: Ref<E>) {
        this.parent = parent
        this.depth = parent ? parent.depth + 1 : 0

        this.externalRef = ref
    }

    // Check whether this element has a MotionValue of the provided key
    hasValue(key: string) {
        return this.values.has(key)
    }

    // Add a MotionValue
    addValue(key: string, value: MotionValue) {
        if (this.hasValue(key)) this.removeValue(key)

        this.values.set(key, value)
        this.latest[key] = value.get()

        if (this.element) this.subscribeToValue(key, value)
    }

    // Remove a MotionValue
    removeValue(key: string) {
        const unsubscribe = this.valueSubscriptions.get(key)
        unsubscribe && unsubscribe()

        this.values.delete(key)
        delete this.latest[key]
        this.valueSubscriptions.delete(key)
    }

    // Get a MotionValue. If provided a defaultValue, create and set to that
    getValue<Value>(key: string): MotionValue<Value> | undefined
    getValue<Value>(key: string, defaultValue: Value): MotionValue<Value>
    getValue<Value>(
        key: string,
        defaultValue?: Value
    ): MotionValue<Value> | undefined {
        let value = this.values.get(key)
        if (value === undefined && defaultValue !== undefined) {
            value = new MotionValue(defaultValue)
            this.addValue(key, value)
        }
        return value
    }

    updateProps(props: MotionProps) {
        this.props = props
    }

    forEachValue(callback: (value: MotionValue, key: string) => void) {
        this.values.forEach(callback)
    }

    getInstance() {
        return this.element
    }

    private update = () => this.props.onUpdate!(this.latest)

    // Trigger a synchronous render using the latest MotionValues
    abstract render: () => void

    // Build display attributes
    abstract build(): void

    // Directly read a value from the underlying element
    abstract readNativeValue(key: string): string | number

    // Subscribe to changes in a MotionValue
    private subscribeToValue(key: string, value: MotionValue) {
        const onChange = (latest: string | number) => {
            this.latest[key] = latest
            this.props.onUpdate && sync.update(this.update, false, true)
        }

        const onRender = () => sync.render(this.render, false, true)

        const unsubscribeOnChange = value.onChange(onChange)
        const unsubscribeOnRender = value.onRenderRequest(onRender)

        this.valueSubscriptions.set(key, () => {
            unsubscribeOnChange()
            unsubscribeOnRender()
        })
    }

    // Mount the VisualElement with the actual DOM element
    private mount(element: E) {
        this.element = this.current = element

        // Subscribe to any pre-existing MotionValues
        this.values.forEach((value, key) => this.subscribeToValue(key, value))
    }

    private unmount() {
        this.values.forEach((_, key) => this.removeValue(key))
        cancelSync.update(this.update)
        cancelSync.render(this.render)
    }

    // This function gets passed to the rendered component's `ref` prop
    // and is used to mount/unmount the VisualElement
    ref = (element: E | null) => {
        element ? this.mount(element) : this.unmount()

        if (!this.externalRef) return

        if (typeof this.externalRef === "function") {
            this.externalRef(null)
        } else if (isRefObject(this.externalRef)) {
            ;(this.externalRef as any).current = null
        }
    }
}
