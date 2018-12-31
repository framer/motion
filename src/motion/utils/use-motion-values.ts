import { useMemo, useEffect, RefObject } from "react"
import { MotionValue } from "value"
import styler, { Styler } from "stylefire"

export class MotionValuesMap {
    private hasMounted = false
    private styler: Styler
    private values = new Map<string, MotionValue>()

    has(key: string) {
        return this.values.has(key)
    }

    set(key: string, value: MotionValue) {
        this.values.set(key, value)

        if (this.hasMounted) {
            this.bindValueToStyler(key, value)
        }
    }

    get(key: string) {
        return this.values.get(key)
    }

    forEach(callback: (value: MotionValue, key: string) => void) {
        return this.values.forEach(callback)
    }

    bindValueToStyler(key: string, value: MotionValue) {
        value.setOnRender((v: any) => this.styler.set(key, v))
    }

    mount(element: Element) {
        this.hasMounted = true
        this.styler = styler(element)
        this.values.forEach((value, key) => this.bindValueToStyler(key, value))
    }

    unmount() {
        this.values.forEach(value => value.destroy())
    }
}

export const useMotionValues = ref => {
    const motionValuesMap = useMemo(() => new MotionValuesMap(), [])

    useEffect(() => {
        motionValuesMap.mount(ref.current)
        return () => motionValuesMap.unmount()
    }, [])

    return motionValuesMap
}
