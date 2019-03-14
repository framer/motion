import { RefObject } from "react"

export interface Point {
    x: number
    y: number
}

export namespace Point {
    /** @alpha */
    export const subtract = (a: Point, b: Point): Point => {
        return { x: a.x - b.x, y: a.y - b.y }
    }

    /** @alpha */
    export const pointRelativeTo = (id: string | HTMLElement) => {
        let elem: HTMLElement | null

        const getElem = () => {
            if (elem) return elem
            if (typeof id === "string") {
                elem = document.getElementById(id)
            } else {
                elem = id
            }
        }

        return ({ x, y }: Point): Point | undefined => {
            const localElem = getElem()

            if (!localElem) return undefined
            const rect = localElem.getBoundingClientRect()

            return {
                x: x - rect.left - window.scrollX,
                y: y - rect.top - window.scrollY,
            }
        }
    }
}

export interface EventInfo {
    point: Point
}

export type EventHandler = (event: Event, info: EventInfo) => void

export type ListenerControls = [() => void, () => void]

export type TargetOrRef = EventTarget | RefObject<EventTarget>

export type TargetBasedReturnType<Target> = Target extends EventTarget
    ? ListenerControls
    : undefined
