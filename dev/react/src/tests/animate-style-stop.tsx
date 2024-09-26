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

        const timer = setTimeout(() => {
            animation.stop()
        }, 50)

        return () => {
            clearTimeout(timer)
            animation.stop()
        }
    }, [])

    return <div id="box" ref={ref} style={style} />
}

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
