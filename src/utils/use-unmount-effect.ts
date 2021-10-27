import React from "react"

export function useUnmountEffect(callback: () => void) {
    return React.useEffect(() => () => callback(), [])
}
