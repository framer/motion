import { animateStyle } from "framer-motion/dom"
import { useRef, useEffect } from "react"

export const App = () => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        const animation = animateStyle(
            ref.current,
            { width: 200 },
            { duration: 0.1 }
        )

        return () => animation.stop()
    }, [])

    return <div ref={ref} style={style} />
}

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
