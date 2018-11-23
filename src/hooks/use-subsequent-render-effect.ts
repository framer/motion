import { useRef, useEffect } from "react"

export const useSubsequentRenderEffect = (callback: () => void, conditions: any[]) => {
    const isInitialRender = useRef(true)

    return useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false
        } else {
            return callback()
        }
    }, conditions)
}
