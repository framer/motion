import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement"
import { createContext } from "react"

export interface TransitionHandler {
    updateLayoutBox: (child: HTMLVisualElement) => void
    startAnimation: (child: HTMLVisualElement) => void
}

export interface BatchMeasure {
    add: (child: HTMLVisualElement) => void
    flush: (handler?: TransitionHandler) => void
}

const defaultHandler: TransitionHandler = {
    updateLayoutBox: child => child.updateLayoutBox(),
    startAnimation: child => {},
}

const sortByDepth = (a: HTMLVisualElement, b: HTMLVisualElement) =>
    a.depth - b.depth

export function createBatcher(): BatchMeasure {
    const queue = new Set<HTMLVisualElement>()

    const add = (child: HTMLVisualElement) => queue.add(child)

    const flush = ({
        updateLayoutBox,
        startAnimation,
    }: TransitionHandler = defaultHandler) => {
        if (!queue.size) return

        const order = Array.from(queue).sort(sortByDepth)

        order.forEach(child => child.resetTransform())
        order.forEach(updateLayoutBox)
        order.forEach(startAnimation)
    }

    return { add, flush }
}

export const SyncContext = createContext(createBatcher())
