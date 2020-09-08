import * as React from "react"
import { CSSProperties, useState } from "react"
import { motion, AnimateSharedLayout, AnimatePresence } from "@framer"

/**
 * This demonstrates children with layoutId animating
 * back to their origin components
 */

const transition = { type: "spring", stiffness: 500, damping: 30 }

function Gallery({ items, setIndex }) {
    return (
        <ul style={container}>
            {items.map((color, i) => (
                <motion.li
                    key={color}
                    onClick={() => setIndex(i)}
                    initial={{ borderRadius: 10 }}
                    style={{ ...item, backgroundColor: color }}
                    layoutId={color}
                    id={i === 0 && "list-red"}
                >
                    <motion.div style={child} layoutId={`child-${color}`} />
                </motion.li>
            ))}
        </ul>
    )
}

function SingleImage({ color, index, setIndex }) {
    return (
        <div style={singleImageContainer}>
            <div onClick={() => setIndex(index - 1)} style={prev} />
            <motion.div
                id="color"
                layoutId={color}
                initial={{ borderRadius: 20 }}
                style={{ ...singleImage, backgroundColor: color }}
            >
                <motion.div
                    style={child}
                    id="child"
                    layoutId={`child-${color}`}
                />
            </motion.div>
            <div onClick={() => setIndex(index + 1)} style={next} />
        </div>
    )
}

export function Component() {
    const [index, setIndex] = useState<false | number>(false)
    return (
        <>
            <Gallery items={colors} setIndex={setIndex} />
            <AnimatePresence>
                {index !== false && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={overlay}
                        id="overlay"
                        key="overlay"
                        onClick={() => setIndex(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {index !== false && (
                    <SingleImage
                        index={index}
                        key={colors[index]}
                        color={colors[index]}
                        setIndex={setIndex}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

export function App() {
    return (
        <AnimateSharedLayout>
            <Component />
        </AnimateSharedLayout>
    )
}

const numColors = 4 * 4
const makeColor = (hue) => `hsl(${hue}, 100%, 50%)`
const colors = Array.from(Array(numColors)).map((_, i) =>
    makeColor(Math.round((360 / numColors) * i))
)

const container = {
    backgroundColor: "#eeeeee",
    borderRadius: "25px",
    width: "600px",
    height: "600px",
    margin: "0",
    padding: "0 20px 20px 0",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "space-between",
    listStyle: "none",
}

const item = {
    padding: "20px",
    cursor: "pointer",
    margin: "20px 0 0 20px",
    flex: "1 1 90px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}

const overlay = {
    background: "rgba(0,0,0,0.6)",
    position: "absolute",
    top: "0",
    left: "0",
    bottom: "0",
    right: "0",
}

const singleImageContainer: CSSProperties = {
    position: "absolute",
    top: "0",
    left: "0",
    bottom: "0",
    right: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
}

const singleImage = {
    width: "500px",
    height: "300px",
    padding: 50,
}

const child = {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "red",
    //opacity: 0.5,
}

const next = {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: "rgba(255,255,255,0.5)",
    margin: 10,
    pointerEvents: "auto",
}

const prev = {
    ...next,
}
