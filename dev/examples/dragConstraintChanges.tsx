import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: "10px",
    position: "absolute",
}
export const App = () => {
    const [constraint, setContraint] = React.useState(0)
    function onDrag(event, { point }) {
        setContraint(point.x)
    }
    return (
        <>
            <motion.div
                drag="x"
                dragConstraints={{
                    left: constraint,
                    right: constraint,
                }}
                dragElastic
                dragMomentum
                dragTransition={{ bounceStiffness: 200, bounceDamping: 40 }}
                style={{ ...styleA, y: -100 }}
            />

            <motion.div
                drag="x"
                dragElastic
                dragMomentum
                onDrag={onDrag}
                dragTransition={{ bounceStiffness: 200, bounceDamping: 40 }}
                style={{ ...styleA, y: 100 }}
            />
        </>
    )
}
