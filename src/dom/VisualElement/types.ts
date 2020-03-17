import { TransformTemplate } from "motion/types"

export interface MountedVisualElement {
    getBoundingBox(): BoundingBox
    getComputedStyle(): CSSStyleDeclaration
    setStyle(key: string, value: string | number): void
    readStyle(key: string): string | number | null
    render(options: VisualElementOptions): void
}

export interface Styles {
    [key: string]: string | number
}

export interface BoundingBox {
    top: number
    left: number
    right: number
    bottom: number
    width: number
    height: number
    x: number
    y: number
}

export interface VisualElementOptions {
    enableHardwareAcceleration?: boolean
    isDashCase?: boolean
    transformTemplate?: TransformTemplate
}
