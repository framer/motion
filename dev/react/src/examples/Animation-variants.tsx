import { Fragment, useState } from "react"
import { motion, createMotionComponent, useMotionValue } from "framer-motion"

const MotionFragment = createMotionComponent(Fragment)

export function App() {
    const backgroundColor = useMotionValue("#f00")
    const [isActive, setIsActive] = useState(true)
    return (
        <MotionFragment initial="initial" animate={isActive ? "to" : "initial"}>
            <motion.div>
                <motion.div
                    variants={{
                        initial: {
                            backgroundColor: "#f00",
                        },
                        to: {
                            backgroundColor: "#00f",
                        },
                    }}
                    onClick={() => setIsActive(!isActive)}
                    style={{ ...box, backgroundColor }}
                />
            </motion.div>
        </MotionFragment>
    )
}

const box = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
