import { ElementOrSelector } from "../../../animation/types"
import { resizeElement } from "./handle-element"
import { resizeWindow } from "./handle-window"
import { ResizeHandler } from "./types"

export function resize(onResize: ResizeHandler<Window>): VoidFunction
export function resize(
    target: ElementOrSelector,
    onResize: ResizeHandler<Element>
): VoidFunction
export function resize(
    a: ResizeHandler<Window> | ElementOrSelector,
    b?: ResizeHandler<Element>
) {
    return typeof a === "function" ? resizeWindow(a) : resizeElement(a, b!)
}
