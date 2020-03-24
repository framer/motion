import React, { CSSProperties } from "react"
import { useState } from "react"
import { motion, MagicMotion, AnimatePresence } from "@framer"

const transition = { duration: 5 } //{ type: "spring", stiffness: 500, damping: 30 }

function Gallery({ items, setIndex }) {
    return (
        <ul style={container}>
            {items.map((color, i) => (
                <motion.li
                    key={color}
                    onClick={() => setIndex(i)}
                    style={{ ...item, backgroundColor: color }}
                    magicId={color}
                    magicTransition={transition}
                    id={i === 0 && "list-red"}
                >
                    <motion.div
                        style={child}
                        magicId={`child-${color}`}
                        magicTransition={transition}
                    />
                </motion.li>
            ))}
        </ul>
    )
}

function SingleImage({ color, index, setIndex }) {
    //const close = () => setIndex(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                id="overlay"
                style={overlay}
                onClick={() => setIndex(false)}
            />
            <div style={singleImageContainer}>
                {/* <div className="button prev" onClick={() => setIndex(index - 1)} />
      <div className="button next" onClick={() => setIndex(index + 1)} />
      <div className="button close" onClick={close} /> */}
                <motion.div
                    id="color"
                    magicId={color}
                    magicTransition={transition}
                    style={{ ...singleImage, backgroundColor: color }}
                >
                    <motion.div
                        style={child}
                        id="child"
                        magicId={`child-${color}`}
                        magicTransition={transition}
                    />
                </motion.div>
            </div>
        </>
    )
}

export function App() {
    const [index, setIndex] = useState<false | number>(false)

    return (
        <MagicMotion>
            <Gallery items={colors} setIndex={setIndex} />
            <AnimatePresence>
                {index !== false && (
                    <SingleImage
                        index={index}
                        color={colors[index]}
                        setIndex={setIndex}
                    />
                )}
            </AnimatePresence>
        </MagicMotion>
    )
}

const numColors = 4 * 4
const makeColor = hue => `hsl(${hue}, 100%, 50%)`
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
    borderRadius: "10px",
    padding: "20px",
    cursor: "pointer",
    margin: "20px 0 0 20px",
    flex: "1 1 90px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}

const overlay = {
    background: "black",
    opacity: "0.2",
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
    borderRadius: "20px",
    width: "500px",
    height: "300px",
    padding: 50,
}

const child = {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    //opacity: 0.5,
}
