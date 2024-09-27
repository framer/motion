import { spring } from "framer-motion"
import { animateMini } from "framer-motion/dom"
import { useRef, useEffect } from "react"

export const App = () => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        ref.current.style.backgroundColor = "red"

        let animation = animateMini(
            ref.current,
            { width: [null, 200] },
            { duration: 0.1 }
        )

        if (animation.duration === 0.1) {
            animation = animateMini(ref.current, { width: [null, 200] }, {})

            if (animation.duration === 0.3) {
                animation = animateMini(
                    ref.current,
                    { width: [null, 200] },
                    { type: spring }
                )

                if (animation.duration === 1.06) {
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
