import { useEffect } from "react"

export function useUnmountEffect(callback: () => void) {
    useEffect(() => () => callback(), [])
}
