import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of providing a MotionValue to an SVG component via its props
 */

export const App = () => {
    const [state, setState] = React.useState(false)
    return (
        <svg
            width="250"
            height="250"
            viewBox="0 0 250 250"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => setState(!state)}
            style={{ "--color": "#f00" } as any}
        >
            <motion.circle
                initial={false}
                cx={125}
                cy={125}
                r="100"
                animate={{ fill: state ? "var(--color)" : "#00f" }}
                transition={{ duration: 3, ease: () => 0.5 }}
            />
        </svg>
    )
}
