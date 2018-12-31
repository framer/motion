import * as React from "react"
import { useRef, useState } from "react"
import { useTapGesture, Frame } from "@framer"

const Box = Frame({
    tap: {
        rotate: 45,
    },
})

export const App = () => {
    const ref = useRef(null)
    const [state, setState] = useState<"tap" | "default">("default")
    const onTap = () => {
        setState("tap")
    }
    useTapGesture({ onTap }, ref)
    return <Box pose={state} ref={ref} />
}
