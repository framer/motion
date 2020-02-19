import { Ref } from "react"
import styler, { Styler } from "stylefire"
import { invariant } from "hey-listen"
import { useConstant } from "../../utils/use-constant"
import { isRefObject } from "../../utils/is-ref-object"
import { MotionValuesMap } from "./use-motion-values"
import { syncRenderSession } from "../../dom/sync-render-session"

type Subscription<E extends Element = Element> = (
    nativeElement: NativeElement<E>
) => void

// Subscriptions need to be added with unique identifiers to make them concurrent-safe
function subscribe(
    id: Symbol,
    subscribers: Map<Symbol, Subscription>,
    sub: Subscription
) {
    subscribers.set(id, sub)
    return () => subscribers.delete(id)
}

export class NativeElement<E extends Element = Element> {
    hasMounted = false
    externalRef?: Ref<E>

    current: E
    styler: Styler

    mountSubscriptions: Map<Symbol, Subscription> = new Map()
    unmountSubscriptions: Map<Symbol, Subscription> = new Map()

    constructor(externalRef?: Ref<E>) {
        this.externalRef = externalRef
    }

    mount(element: E) {
        this.hasMounted = true
        this.current = element
        this.styler = styler(element)
        this.mountSubscriptions.forEach(sub => sub(this))
        this.mountSubscriptions.clear()

        if (!this.externalRef) return

        if (typeof this.externalRef === "function") {
            this.externalRef(element)
        } else if (isRefObject(this.externalRef)) {
            ;(this.externalRef as any).current = element
        }
    }

    unmount() {
        this.unmountSubscriptions.forEach(sub => sub(this))
        this.unmountSubscriptions.clear()

        delete this.current
        delete this.styler

        if (!this.externalRef) return

        if (typeof this.externalRef === "function") {
            this.externalRef(null)
        } else if (isRefObject(this.externalRef)) {
            ;(this.externalRef as any).current = null
        }
    }

    onMount(id: Symbol, sub: Subscription) {
        return subscribe(id, this.mountSubscriptions, sub)
    }

    onUnmount(id: Symbol, sub: Subscription) {
        return subscribe(id, this.unmountSubscriptions, sub)
    }

    ref = (element: E | null) => {
        if (element !== null && !this.hasMounted) {
            this.mount(element)
        } else if (element === null) {
            this.unmount()
        }
    }

    setStyle(key: string | { [key: string]: any }, value?: any) {
        this.styler && this.styler.set(key, value)
    }

    getStyle(key: string) {
        invariant(
            this.hasMounted,
            "Attempting to read styles of an unmounted element"
        )
        return this.styler && this.styler.get(key)
    }

    getInstance() {
        return this.current
    }

    getBoundingBox() {
        return this.current.getBoundingClientRect()
    }

    getComputedStyle() {
        return window.getComputedStyle(this.current)
    }

    render() {
        this.styler.render()
    }
}

const subscriberSymbol = Symbol("self")

export function useNativeElement<E extends Element = Element>(
    values: MotionValuesMap,
    enableHardwareAcceleration: boolean,
    externalRef?: Ref<E>
) {
    return useConstant(() => {
        const nativeElement = new NativeElement(externalRef)

        nativeElement.onMount(subscriberSymbol, () => {
            const element = nativeElement.getInstance()

            invariant(
                element instanceof Element,
                "No ref found. Ensure components created with motion.custom forward refs using React.forwardRef"
            )

            nativeElement.styler = styler(element, {
                preparseOutput: false,
                enableHardwareAcceleration,
            })

            values.mount((key, value) => {
                nativeElement.setStyle(key, value)

                if (syncRenderSession.isOpen()) {
                    syncRenderSession.push(nativeElement)
                }
            })
        })

        nativeElement.onUnmount(subscriberSymbol, () => values.unmount())

        return nativeElement
    })
}
