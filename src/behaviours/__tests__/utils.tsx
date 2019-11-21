import * as React from "react"
import sync from "framesync"
import { MotionPlugins } from "../../motion/context/MotionPluginContext"
import { act } from "@testing-library/react"
import { fireEvent } from "@testing-library/dom"

export type Point = {
    x: number
    y: number
}

const pos: Point = {
    x: 0,
    y: 0,
}

export const drag = (element: any) => {
    pos.x = 0
    pos.y = 0
    fireEvent.mouseDown(element)

    const controls = {
        to: (x: number, y: number) => {
            pos.x = x
            pos.y = y
            fireEvent.mouseMove(document.body, { buttons: 1 })

            return controls
        },
        end: () => {
            fireEvent.mouseUp(element)
        },
    }

    return controls
}

export const asyncDrag = (element: any) => {
    pos.x = 0
    pos.y = 0
    fireEvent.mouseDown(element)

    const controls = {
        to: async (x: number, y: number) => {
            pos.x = x
            pos.y = y

            await act(async () => {
                fireEvent.mouseMove(document.body, { buttons: 1 })
                await new Promise(resolve => sync.update(resolve))
            })

            return controls
        },
        end: () => {
            fireEvent.mouseUp(element)
        },
    }

    return controls
}

export const MockDrag = ({ children }: { children: React.ReactNode }) => (
    <MotionPlugins transformPagePoint={() => pos}>{children}</MotionPlugins>
)
