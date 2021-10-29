import * as React from "react"
import { CSSProperties, useState } from "react"
import { motion, AnimatePresence, useIsPresent, Transition } from "@framer"

/**
 * This demonstrates children with layoutId animating
 * back to their origin components
 */

const params = new URLSearchParams(window.location.search)
const instant = params.get("instant") || false
const partialEase = params.get("partial-ease") || false
const type = params.get("type") || "switch"
let transition: Transition = instant ? { type: false } : { duration: 3 }
if (partialEase) {
    transition = {
        duration: 0.15,
        ease: () => 0.1,
    }
}

function Gallery({ items, setIndex }) {
    return (
        <ul style={container}>
            {items.map((color, i) => (
                <motion.li
                    key={color}
                    onClick={() => setIndex(i)}
                    style={{ ...item, backgroundColor: color, borderRadius: 0 }}
                    layoutId={color}
                    transition={transition}
                    id={i === 0 ? `item-parent` : undefined}
                >
                    <motion.div
                        style={child}
                        id={i === 0 ? `item-child` : undefined}
                        layoutId={`child-${color}`}
                        transition={transition}
                    />
                </motion.li>
            ))}
        </ul>
    )
}

function SingleImage({ color, setIndex }) {
    const isPresent = useIsPresent()

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    ...overlay,
                    pointerEvents: isPresent ? "auto" : "none",
                }}
                id="overlay"
                transition={transition}
                onClick={() => setIndex(false)}
            />
            <div style={singleImageContainer}>
                <motion.div
                    id="parent"
                    layoutId={color}
                    style={{
                        ...singleImage,
                        backgroundColor: "#fff",
                        borderRadius: 50,
                    }}
                    transition={transition}
                >
                    <motion.div
                        style={{ ...child, backgroundColor: "black" }}
                        id="child"
                        layoutId={`child-${color}`}
                        transition={transition}
                    />
                </motion.div>
            </div>
        </>
    )
}

export function App() {
    const [index, setIndex] = useState<false | number>(false)

    if (partialEase) {
        if (index === 0) {
            transition.ease = () => 0.1
        } else {
            transition.ease = (t: number) => (t === 1 ? 1 : 0.9)
        }
    }

    return (
        <div style={background}>
            <Gallery items={colors} setIndex={setIndex} />
            <AnimatePresence>
                {index !== false && (
                    <SingleImage color={colors[index]} setIndex={setIndex} />
                )}
            </AnimatePresence>
        </div>
    )
}

const numColors = 3 // 4 * 4
const makeColor = (hue) => `hsl(${hue}, 100%, 50%)`
const colors = Array.from(Array(numColors)).map((_, i) =>
    makeColor(Math.round((360 / numColors) * i))
)

const background = {
    position: "fixed",
    top: "0",
    left: "0",
    bottom: "0",
    right: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#ccc",
}

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
    position: "fixed",
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
    backgroundColor: "white",
    opacity: 0.5,
}
