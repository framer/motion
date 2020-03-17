import { MountedVisualElement, Styles } from "../types"
import { isTransformProp } from "../utils/transform"
import { getValueType } from "../../value-types"
import { prefix } from "./prefix"
import { createBuildStyles } from "../utils/style"

export class HTMLVisualElement implements MountedVisualElement {
    readonly element: HTMLElement
    readonly buildStyles: (styles: Styles) => Styles

    styles: Styles = {}
    cssVariables: Styles = {}
    changedCSSVariables: string[] = []

    constructor(element: HTMLElement) {
        this.element = element
        this.buildStyles = createBuildStyles()
    }

    getBoundingBox() {
        return this.element.getBoundingClientRect()
    }

    getComputedStyle() {
        return window.getComputedStyle(this.element)
    }

    setStyle(key: string, value: string | number) {
        if (key.startsWith("--")) {
            this.cssVariables[key] = value
            if (!this.changedCSSVariables.length) {
                this.changedCSSVariables.push(key)
            }
        } else {
            this.styles[key] = value
        }
    }

    readStyle(key: string) {
        if (isTransformProp(key)) {
            const defaultValueType = getValueType(key)
            return defaultValueType ? defaultValueType.default || 0 : 0
        } else {
            return this.getComputedStyle().getPropertyValue(prefix(key, true))
        }
    }

    render() {
        Object.assign(this.element.style, this.buildStyles(this.styles))

        const numChangedCSSVariables = this.changedCSSVariables.length
        if (!numChangedCSSVariables) return

        for (let i = 0; i < numChangedCSSVariables; i++) {
            const key = this.changedCSSVariables[i]
            if (key.startsWith("--")) {
                this.element.style.setProperty(
                    key,
                    this.cssVariables[key] as string
                )
            }
        }
        this.changedCSSVariables.length = 0
    }
}
