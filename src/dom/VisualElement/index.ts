import { isHTMLElement } from "./html/is-html-element"
import { isSVGElement } from "./svg/is-svg-element"
import { invariant } from "hey-listen"
import { HTMLVisualElement } from "./html"
import { SVGVisualElement } from "./svg"
import sync from "framesync"
import { Styles, BoundingBox } from "./types"

export class VisualElement {
    interface: HTMLVisualElement | SVGVisualElement

    options = {}

    needsRender = false

    mount(element: HTMLElement | SVGElement) {
        if (isHTMLElement(element)) {
            this.interface = new HTMLVisualElement(element)
        } else if (isSVGElement(element)) {
            this.interface = new SVGVisualElement(element)
        }
    }

    get current() {
        return this.getInstance()
    }

    hasMounted() {
        return !!this.interface
    }

    getInstance() {
        return this.interface.element
    }

    getBoundingBox(): BoundingBox {
        invariant(!!this.interface, "")

        return this.interface.getBoundingBox()
    }

    getComputedStyle() {
        invariant(!!this.interface, "")

        return this.interface.getComputedStyle()
    }

    setOption(key: string, value: any) {
        this.options[key] = value
    }

    setStyle(values: string, value: string | number): void
    setStyle(values: Styles): void
    setStyle(values: string | Styles, value?: string | number): void {
        invariant(!!this.interface, "")

        if (typeof values === "string") {
            this.setSingleStyle(values, value as string | number)
        } else {
            for (const key in values) {
                this.setSingleStyle(key, values[key])
            }
        }
    }

    private setSingleStyle(key: string, value: string | number) {
        this.interface.setStyle(key, value)

        if (!this.needsRender) {
            this.needsRender = true
            sync.render(this.render)
        }
    }

    readStyle(key: string) {
        invariant(!!this.interface, "")

        return this.interface.readStyle(key)
    }

    render = () => {
        invariant(!!this.interface, "")

        if (!this.needsRender) return

        this.interface.render(this.options)
        this.needsRender = false
    }
}
