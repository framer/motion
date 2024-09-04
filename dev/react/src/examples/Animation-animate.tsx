import { motion, findSpring } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

function defineSpring(duration: number, bounciness: number) {
    // Assume mass is 1 for simplicity
    const mass = 1.0

    // If bounciness is 0, use critical damping (ζ = 1)
    let dampingRatio = 1.0

    if (bounciness > 0) {
        // For bounciness > 0, use an empirical approach to balance duration and damping
        dampingRatio = 1 - bounciness // Simple mapping, adjust as needed
    }

    // Calculate natural frequency ω₀ for the desired duration
    const undampedAngularFreq = (2 * Math.PI) / duration

    // Calculate stiffness k using ω₀ = sqrt(k / m)
    const stiffness = Math.pow(undampedAngularFreq, 2) * mass

    // Calculate damping c using ζ = c / (2 * sqrt(k * m))
    const damping = 2 * dampingRatio * Math.sqrt(stiffness * mass)

    return { stiffness, damping }
}

let start = 0

export const App = () => {
    const [state, setState] = useState(false)
    useEffect(() => {
        if (state) {
            console.log(
                findSpring({ duration: 1000, bounce: 0.5 }),
                defineSpring(1, 0.5)
            )
            console.log(
                findSpring({ duration: 2000, bounce: 0 }),
                defineSpring(2, 0)
            )
            console.log(
                findSpring({ duration: 300, bounce: 1 }),
                defineSpring(0.3, 1)
            )
        }

        // setTimeout(() => {
        //     setState(true)
        // }, 300)
    }, [state])

    return (
        <motion.div
            animate={{ x: state ? 0 : 100 }}
            transition={{
                type: "spring",
                // duration: 1,
                // bounce: 0,
                ...defineSpring(3, 0),
                restDelta: 0.5,
                restSpeed: 1,
            }}
            style={style}
            onAnimationStart={() => (start = performance.now())}
            onAnimationComplete={() => console.log(performance.now() - start)}
        >
            content
        </motion.div>
    )
}
