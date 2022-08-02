import { createContext, MutableRefObject, RefObject, Ref } from "react"

export type DimensionsState = {
    size: { width: number; height: number }
    dpr?: number
}

export type SetLayoutCamera = (ref: Ref<any>) => void
export type SetDimensions = (state: DimensionsState) => void

export interface MotionCanvasContextProps {
    layoutCamera: RefObject<any>
    dimensions: MutableRefObject<DimensionsState>
    requestedDpr: number
}

export const MotionCanvasContext = createContext<
    MotionCanvasContextProps | undefined
>(undefined)
