import { ComponentType } from "react"
import { lowercaseSVGElements } from "./supported-elements"

export function isSVGComponent(Component: string | ComponentType) {
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    if (typeof Component !== "string") return false

    /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    if (Component.includes("-")) return false

    /**
     * If it's in our list of lowercase SVG tags, it's an SVG component
     */
    if (lowercaseSVGElements.indexOf(Component) > -1) return true

    /**
     * If it contains a capital letter, it's an SVG component
     */
    if (/[A-Z]/.test(Component)) return true
}
