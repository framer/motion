import * as React from "react"
import { motion, useAnimator } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}
const stylea = {
    width: 50,
    height: 50,
    background: "blue",
}

export const App = () => {
    const animator = useAnimator({
        visible: { opacity: 1, transition: { beforeChildren: true } },
        hidden: { opacity: 0.3 },
    })

    const childAnimator = useAnimator({
        visible: { x: 0 },
        hidden: { x: 100 },
    })

    const [isVisible, setVisible] = React.useState(false)

    return (
        <motion.div
            animator={animator}
            style={style}
            pose={isVisible ? "visible" : "hidden"}
            onClick={() => setVisible(!isVisible)}
            onPoseComplete={console.log}
        >
            <motion.div animator={childAnimator} style={stylea} inheritPose />
        </motion.div>
    )
}
