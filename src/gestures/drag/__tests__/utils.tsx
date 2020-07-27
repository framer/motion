import * as React from "react"
import sync from "framesync"
import { MotionConfig } from "../../../motion/context/MotionConfigContext"
import { act } from "react-dom/test-utils"
import { fireEvent } from "@testing-library/dom"

export type Point = {
    x: number
    y: number
}

const pos: Point = {
    x: 0,
    y: 0,
}

export const frame = {
    postRender: () => new Promise(resolve => sync.postRender(resolve)),
}

type Deferred<T> = {
    promise: Promise<T>
    resolve: unknown extends T ? () => void : (value: T) => void
}

export function deferred<T>(): Deferred<T> {
    const def = {} as Deferred<T>
    def.promise = new Promise(resolve => {
        def.resolve = resolve as any
    })
    return def
}

export const drag = (element: any, triggerElement?: any) => {
    pos.x = 0
    pos.y = 0
    fireEvent.mouseDown(triggerElement || element)

    const controls = {
        to: async (x: number, y: number) => {
            pos.x = x
            pos.y = y

            await act(async () => {
                fireEvent.mouseMove(document.body, { buttons: 1 })
                await frame.postRender()
            })

            return controls
        },
        end: () => {
            fireEvent.mouseUp(element)
        },
    }

    return controls
}

export const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

export const MockDrag = ({ children }: { children: React.ReactNode }) => (
    <MotionConfig transformPagePoint={() => pos}>{children}</MotionConfig>
)
