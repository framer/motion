import * as React from "react"
import { useAnimation, distance2D, wrap } from "framer-motion"
import { motion } from "framer-motion"

const count = 100
const len = Math.floor(Math.sqrt(count))
const max = Math.hypot(len, len)
const col = (v) => wrap(0, len, v)
const row = (i) => Math.floor(i / len)
const stagger = 0.1

let interval

export const App = () => {
    const [center, setCenter] = React.useState({ x: len / 2, y: len / 2 })

    const cells = Array.from(Array(count).keys()).map((i) => {
        return (
            <Cell
                center={center}
                i={i}
                onClick={() => setCenter({ x: col(i), y: row(i) })}
            />
        )
    })

    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${len}, 1fr)`,
                    gridGap: 8,
                    height: 320,
                    width: 320,
                    margin: "32px auto",
                }}
            >
                {cells}
            </div>
            click to ripple
        </div>
    )
}

const Cell = ({ center, i, onClick }) => {
    const x = col(i)
    const y = row(i)
    const d = distance2D({ x, y }, center)
    const n = Math.max(d / max, 0.05) // normalized

    const animation = useAnimation()

    const animate = async () => {
        await animation.start({
            scale: 1,
            y: 0,
            opacity: 1,
            transition: { duration: 0.15 },
        })

        await animation.start({
            scale: Math.min(1, 0.2 + n),
            y: Math.max(0, (0.5 - n) * 50),
            opacity: 0.5,
            transition: {
                delay: d * stagger,
                type: "tween",
                ease: "easeInOut",
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
            },
        })
    }

    React.useEffect(() => {
        animate()
    })

    return (
        <div style={{ height: "100%", width: "100%" }} onClick={onClick}>
            <motion.div
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                    background: "white",
                }}
                animate={animation}
                key={`cell_${i}`}
            />
        </div>
    )
}
