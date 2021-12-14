import { createContext, RefObject, Ref } from "react"

export type SetLayoutCamera = (ref: Ref<any>) => void
export type SetSize = (size: { width: number; height: number }) => void

export interface MotionCanvasContextProps {
    layoutCamera: RefObject<any>
    setSize: SetSize
}

export const MotionCanvasContext = createContext<
    MotionCanvasContextProps | undefined
>(undefined)
