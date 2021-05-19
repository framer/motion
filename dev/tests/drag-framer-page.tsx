import { motion, useMotionValue, AnimateSharedLayout } from "@framer"
import * as React from "react"

/**
 * This demo copies the rough setup of a nested Scroll/Page
 * combo in Framer.
 */

export const App = () => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const dummyX = useMotionValue(0)
    const dummyY = useMotionValue(0)

    const [count, setCount] = React.useState(0)

    return (
        <motion.div style={scrollContainer} layout id="root">
            <motion.div
                id="parent"
                style={b}
                drag="y"
                _dragX={dummyX}
                _dragY={dummyY}
            >
                <motion.div
                    style={{ ...pageContainer, x, y }}
                    layout
                    id="Page"
                    onClick={() => setCount(count + 1)}
                    onPointerEnter={() => setCount(count + 1)}
                    _accountForTransform
                >
                    <Page x={x} y={y} id="a" />
                    <Page x={x} y={y} id="b" />
                    <Page x={x} y={y} id="c" />
                    <Page x={x} y={y} id="d" />
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

function Page({ x, y, id }: any) {
    return (
        <motion.div
            layout
            _dragX={x}
            _dragY={y}
            id={id}
            drag="x"
            style={{
                width: 180,
                height: 180,
                background: "#ffcc00",
                borderRadius: 10,
                flex: "0 0 180px",
            }}
        >
            <motion.div layout style={c} id={`inner-square-${id}`}>
                <Square id={id} />
            </motion.div>
        </motion.div>
    )
}

function Square({ id }) {
    const [count, setCount] = React.useState(0)
    return (
        <AnimateSharedLayout>
            <motion.div
                id={id + "Square"}
                layout
                style={{
                    width: 50,
                    height: 50,
                    background: "#09f",
                    borderRadius: 10,
                }}
                transition={{ duration: 2 }}
                drag
                onClick={(e) => {
                    // e.stopPropagation()
                    setCount(count + 1)
                }}
                onHoverStart={() => setCount(count + 1)}
            />
        </AnimateSharedLayout>
    )
}

const scrollContainer: React.CSSProperties = {
    position: "absolute",
    top: 100,
    left: 100,
    width: 600,
    height: 500,
    overflow: "hidden",
}

const pageContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    width: 180,
    height: 180,
    position: "relative",
    top: 300,
    left: 10,
}

const box = {
    background: "#ff0055",
}

const b = {
    ...box,
    top: 100,
    left: 100,
    width: "100%",
    height: 500,
    borderRadius: 10,
}

const a = {
    position: "relative",
    top: 50,
    left: 50,
    width: 600,
    height: 200,
    background: "#ffcc00",
    borderRadius: 10,
}

const c = {
    position: "relative",
    top: 50,
    left: 50,
    width: 100,
    height: 100,
    background: "#ffaa00",
    borderRadius: 10,
}
