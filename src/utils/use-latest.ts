import * as React from "react"

export function useLatest<T>(value: T) {
    const ref = React.useRef(value)

    React.useEffect(() => {
        ref.current = value
    })

    return ref
}
