import { animateStyle } from "framer-motion/dom"
import { useRef, useEffect } from "react"

export const App = () => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        const animation = animateStyle(
            ref.current,
            { width: 200 },
            { duration: 2 }
        )

        const timer = setTimeout(() => {
            if (!ref.current) return
            animateStyle(ref.current, { width: 100 }, { duration: 0.5 })
        }, 1000)

        return () => {
            animation.stop()
            clearTimeout(timer)
        }
    }, [])

    return (
        <div id="box" ref={ref} style={style}>
            content
        </div>
    )
}

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
