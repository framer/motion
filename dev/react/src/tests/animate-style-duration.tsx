import { spring } from "framer-motion"
import { animate } from "framer-motion/dom/mini"
import { useRef, useEffect } from "react"

export const App = () => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        ref.current.style.backgroundColor = "red"

        let animation = animate(
            ref.current,
            { width: [null, 200] },
            { duration: 0.1 }
        )

        if (animation.duration === 0.1) {
            animation = animate(ref.current, { width: [null, 200] }, {})

            if (animation.duration === 0.3) {
                animation = animate(
                    ref.current,
                    { width: [null, 200] },
                    { type: spring }
                )

                if (animation.duration === 1.1) {
                    ref.current.style.backgroundColor = "green"
                }
            }
        }

        return () => {
            animation.cancel()
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
