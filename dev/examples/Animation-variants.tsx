import React from "react"
import { motion, useAnimation, useMotionValue } from "framer-motion"

const MotionFragment = motion(React.Fragment)

export function App() {
    const xa = useMotionValue(0)
    const xb = useMotionValue(0)
    const controls = useAnimation()

    React.useEffect(() => {
        controls
            .start((custom) => {
                return { x: 1 * custom }
            })
            .then(() => {
                console.log([xa.get(), xb.get()])
            })
    })

    return (
        <>
            <motion.div animate={controls} custom={1} style={{ x: xa }} />
            {/* <motion.div
                            animate={controls}
                            custom={2}
                            style={{ x: xb }}
                        /> */}
        </>
    )
}

const box = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
