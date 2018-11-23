import { useRef, useEffect } from "react"

const useSubsequentRenderEffect = (callback: () => void, conditions: any[]) => {
    const isInitialRender = useRef(true)

    return useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false
        } else {
            return callback()
        }
    }, conditions)
}

export default useSubsequentRenderEffect
