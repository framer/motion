import * as React from "react"
import { motion, useMotionValue, useTransform } from "@framer"

export const App = () => {
    const r = useMotionValue(40)
    const fill = useTransform(r, [40, 100], ["#00f", "#f00"])

    return (
        <svg
            width="250"
            height="250"
            viewBox="0 0 250 250"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.circle
                cx={125}
                cy={125}
                r={r}
                fill={fill}
                animate={{ r: 100 }}
                transition={{ duration: 3 }}
            />
        </svg>
    )
}
