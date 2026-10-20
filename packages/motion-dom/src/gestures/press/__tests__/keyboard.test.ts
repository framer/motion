import { press } from "../index"

if (typeof (globalThis as any).PointerEvent === "undefined") {
    ;(globalThis as any).PointerEvent = class extends MouseEvent {
        isPrimary: boolean
        constructor(type: string, init: any = {}) {
            super(type, init)
            this.isPrimary = init.isPrimary ?? true
        }
    }
}

const key = (element: Element, type: "keydown" | "keyup", k = "Enter") =>
    element.dispatchEvent(new KeyboardEvent(type, { key: k }))

/**
 * Track listeners currently attached to an element, by event type.
 */
function trackListeners(element: Element) {
    const live = new Map<EventListenerOrEventListenerObject, string>()
    const add = element.addEventListener.bind(element)
    const remove = element.removeEventListener.bind(element)
    element.addEventListener = ((type: string, fn: any, options: any) => {
        live.set(fn, type)
        add(
            type,
            options?.once
                ? (event: Event) => {
                      live.delete(fn)
                      fn(event)
                  }
                : fn,
            options
        )
    }) as any
    element.removeEventListener = ((type: string, fn: any, options: any) => {
        live.delete(fn)
        remove(type, fn, options)
    }) as any
    return (type: string) => [...live.values()].filter((t) => t === type).length
}

describe("press keyboard accessibility", () => {
    test("focus/blur cycles don't accumulate blur listeners", () => {
        const element = document.createElement("button")
        document.body.appendChild(element)
        const count = trackListeners(element)
        const cancel = press(element, () => {})

        for (let i = 0; i < 3; i++) {
            element.dispatchEvent(new FocusEvent("focus"))
            element.dispatchEvent(new FocusEvent("blur"))
        }

        expect(count("blur")).toBe(0)
        expect(count("keydown")).toBe(0)

        cancel()
        element.remove()
    })

    test("each Enter press fires a single pointerup and releases its listeners", () => {
        const element = document.createElement("button")
        document.body.appendChild(element)
        const count = trackListeners(element)
        let starts = 0
        let ends = 0
        const cancel = press(element, () => {
            starts++
            return () => ends++
        })

        let ups = 0
        element.addEventListener("pointerup", () => ups++)

        element.dispatchEvent(new FocusEvent("focus"))

        for (let i = 0; i < 3; i++) {
            key(element, "keydown")
            // Non-Enter keyup shouldn't end the press
            key(element, "keyup", "a")
            key(element, "keyup")
        }

        expect(ups).toBe(3)
        expect(starts).toBe(3)
        expect(ends).toBe(3)
        // Listeners don't accumulate per press
        expect(count("keyup")).toBeLessThanOrEqual(1)
        expect(count("blur")).toBeLessThanOrEqual(1)

        let cancels = 0
        element.addEventListener("pointercancel", () => cancels++)
        element.dispatchEvent(new FocusEvent("blur"))
        // No press in progress, so blur shouldn't cancel anything
        expect(cancels).toBe(0)
        expect(count("blur")).toBe(0)
        expect(count("keyup")).toBe(0)
        expect(count("keydown")).toBe(0)

        cancel()
        element.remove()
    })

    test("blur during a keyboard press cancels it once", () => {
        const element = document.createElement("button")
        document.body.appendChild(element)
        const count = trackListeners(element)
        const results: boolean[] = []
        const cancel = press(element, () => (_, { success }) => {
            results.push(success)
        })

        let cancels = 0
        element.addEventListener("pointercancel", () => cancels++)

        element.dispatchEvent(new FocusEvent("focus"))
        key(element, "keydown")
        element.dispatchEvent(new FocusEvent("blur"))

        expect(cancels).toBe(1)
        expect(results).toEqual([false])
        expect(count("blur")).toBe(0)
        expect(count("keyup")).toBe(0)
        expect(count("keydown")).toBe(0)

        cancel()
        element.remove()
    })
})
