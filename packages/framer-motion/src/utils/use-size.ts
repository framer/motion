import { RefObject, useEffect, useState } from "react"
import { resize } from "../render/dom/resize"
import { ResizeHandler } from "../render/dom/resize/types"

export function useSize(): void
export function useSize(ref: RefObject<Element>): void
export function useSize(ref?: RefObject<Element>): void {
    const [size, setSize] = useState(null)

    useEffect(() => {
        const updateSize: ResizeHandler<any> = (info) => setSize(info.size)

        return ref && ref.current
            ? resize(ref.current, updateSize)
            : resize(updateSize)
    }, [ref])

    return size
}
