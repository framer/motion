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
    const containerRef = React.useRef<HTMLDivElement>(null)

    const [count, setCount] = React.useState(0)

    React.useLayoutEffect(() => {
        const setScrollY = (yValue: number) => {
            const element = containerRef.current
            if (!(element instanceof HTMLDivElement)) return

            element.scrollTop = -yValue
        }

        const currentY = y.get()
        if (currentY !== 0) setScrollY(currentY)

        return dummyY.onChange(setScrollY)
    }, [dummyY])

    return (
        <motion.div style={scrollContainer} layout id="root" ref={containerRef}>
            <motion.div
                id="parent"
                style={{ ...b }}
                drag="y"
                layout
                dragConstraints={containerRef}
                _dragX={dummyX}
                _dragY={dummyY}
                _applyTransforms
            >
                <motion.div
                    style={{ ...pageContainer, x, y }}
                    layout
                    id="Page"
                    onPointerEnter={() => setCount(count + 1)}
                    _applyTransforms
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
            <AnimateSharedLayout>
                <motion.div layout style={c} id={`inner-square-${id}`}>
                    <Square id={id} />
                </motion.div>
            </AnimateSharedLayout>
        </motion.div>
    )
}

function Square({ id }) {
    const [count, setCount] = React.useState(0)

    return (
        <>
            <motion.div
                id={id + "-square"}
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
            <motion.div
                id={id + "-square-green"}
                layout
                style={{
                    width: 50,
                    height: 50,
                    background: "green",
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
        </>
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
    height: 1000,
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
