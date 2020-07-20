import { Ref } from "react"
import { isRefObject } from "../utils/is-ref-object"
import { MotionValue } from "../value"
import sync, { cancelSync } from "framesync"
import { VisualElementConfig, ResolvedValues } from "./types"
import { AxisBox2D } from "../types/geometry"
import { invariant } from "hey-listen"
import { Snapshot } from "../components/AnimateSharedLayout/stack"

/**
 * VisualElement is an abstract class that provides a generic animation-optimised interface to the
 * underlying renderer.
 *
 * Currently many features interact directly with HTMLVisualElement/SVGVisualElement
 * but the idea is we can create, for instance, a ThreeVisualElement that extends
 * VisualElement and we can quickly offer all the same features.
 */
export abstract class VisualElement<E = any> {
    // A reference to the parent VisualElement
    parent?: VisualElement<E>

    // A reference to the root parent VisualElement
    rootParent: VisualElement<E>

    // An iterable list of current children
    children: Set<VisualElement<E>> = new Set()

    // A snapshot of the previous component that shared a layoutId with this component. Will
    // only be hydrated by AnimateSharedLayout
    prevSnapshot?: Snapshot

    private removeFromParent?: () => void

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

    protected treePath: VisualElement[]

    // A configuration for this VisualElement, each derived class can extend this.
    protected config: VisualElementConfig = {}

    isPresenceRoot?: boolean

    // An alias for element to allow VisualElement to be used
    // like a RefObject. This is a temporary measure to work with
    // some existing internal APIs.
    current: E

    // The depth of this VisualElement in the VisualElement tree
    readonly depth: number

    constructor(parent?: VisualElement<E>, ref?: Ref<E>) {
        // Create a relationship with the provided parent.
        this.parent = parent
        this.rootParent = parent ? parent.rootParent : this

        this.treePath = parent ? [...parent.treePath, parent] : []

        // Calculate the depth of this node in the VisualElement graph
        this.depth = parent ? parent.depth + 1 : 0

        // A reference to any externally-defined React ref. This might live better
        // outside the VisualElement and be handled in a hook.
        this.externalRef = ref
    }

    subscribe(child: VisualElement<E>) {
        this.children.add(child)
        return () => this.children.delete(child)
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

    // Iterate over all MotionValues
    forEachValue(callback: (value: MotionValue, key: string) => void) {
        this.values.forEach(callback)
    }

    // Get the underlying rendered instance of this VisualElement. For instance in
    // HTMLVisualElement this will be a HTMLElement.
    getInstance() {
        return this.element
    }

    updateConfig(config: VisualElementConfig = {}) {
        this.config = { ...config }
    }

    // A pre-bound call to the user-provided `onUpdate` callback. This won't
    // be called more than once per frame.
    private update = () => this.config.onUpdate!(this.latest)

    // Trigger a synchronous render using the latest MotionValues
    abstract render(): void

    // Build display attributes
    abstract build(isReactRender: boolean): void

    // Clean data structures
    abstract clean(): void

    // Directly read a value from the underlying element
    abstract readNativeValue(key: string): string | number

    // A function that returns a bounding box for the rendered instance.
    abstract getBoundingBox(): AxisBox2D

    abstract updateLayoutDelta(): void

    // Set a single `latest` value
    private setSingleStaticValue(key: string, value: string | number) {
        this.latest[key] = value
    }

    // Statically set values to `latest` without needing a MotionValue
    setStaticValues(values: string | ResolvedValues, value?: string | number) {
        if (typeof values === "string") {
            this.setSingleStaticValue(values, value as string | number)
        } else {
            for (const key in values) {
                this.setSingleStaticValue(key, values[key])
            }
        }
    }

    // Pre-bound version of render
    triggerRender = () => this.render()

    scheduleRender = () => sync.render(this.triggerRender, false, true)

    scheduleUpdateLayoutDelta() {
        sync.update(this.rootParent.updateLayoutDelta, false, true)
    }

    // Subscribe to changes in a MotionValue
    private subscribeToValue(key: string, value: MotionValue) {
        const onChange = (latest: string | number) => {
            this.setSingleStaticValue(key, latest)
            this.latest[key] = latest
            this.config.onUpdate && sync.update(this.update, false, true)
        }

        const unsubscribeOnChange = value.onChange(onChange)
        const unsubscribeOnRender = value.onRenderRequest(this.scheduleRender)

        this.valueSubscriptions.set(key, () => {
            unsubscribeOnChange()
            unsubscribeOnRender()
        })
    }

    // Mount the VisualElement with the actual DOM element
    protected mount(element: E) {
        invariant(
            !!element,
            "No ref found. Ensure components created with motion.custom forward refs using React.forwardRef"
        )

        if (this.parent) {
            this.removeFromParent = this.parent.subscribe(this)
        }

        /**
         * Save the element to this.element as a semantic API, this.current to the VisualElement
         * is compatible with existing RefObject APIs.
         */
        this.element = this.current = element

        // Subscribe to any pre-existing MotionValues
        this.forEachValue((value, key) => this.subscribeToValue(key, value))
    }

    // Unmount the VisualElement and cancel any scheduled updates
    private unmount() {
        this.forEachValue((_, key) => this.removeValue(key))
        cancelSync.update(this.update)
        cancelSync.render(this.render)
        this.removeFromParent && this.removeFromParent()
    }

    // This function gets passed to the rendered component's `ref` prop
    // and is used to mount/unmount the VisualElement
    ref = (element: E | null) => {
        element ? this.mount(element) : this.unmount()

        if (!this.externalRef) return

        if (typeof this.externalRef === "function") {
            this.externalRef(element)
        } else if (isRefObject(this.externalRef)) {
            ;(this.externalRef as any).current = element
        }
    }
}
