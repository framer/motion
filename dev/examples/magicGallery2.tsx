import React from "react"
import { useState } from "react"
import { motion, SharedMagicMotion, AnimatePresence } from "@framer"
import styled from "styled-components"

function Gallery({ items, setIndex }) {
    return (
        <ul className="gallery-container">
            {items.map((color, i) => (
                <motion.li
                    className="gallery-item"
                    key={color}
                    onClick={() => setIndex(i)}
                    style={{ backgroundColor: color }}
                    magic
                    sharedId={color}
                />
            ))}
        </ul>
    )
}

function SingleImage({ color, index, setIndex }) {
    //const close = () => setIndex(false);

    return (
        <div className="single-image-container">
            {/* <div className="button prev" onClick={() => setIndex(index - 1)} />
      <div className="button next" onClick={() => setIndex(index + 1)} />
      <div className="button close" onClick={close} /> */}
            <motion.div
                magic
                sharedId={color}
                className="single-image"
                style={{ backgroundColor: color }}
            />
        </div>
    )
}

export function App() {
    const [index, setIndex] = useState(false)

    return (
        <Container>
            <SharedMagicMotion>
                <Gallery items={colors} setIndex={setIndex} />
                <AnimatePresence>
                    {index !== false && (
                        <motion.div
                            key="a"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            className="overlay"
                            onClick={() => setIndex(false)}
                        />
                    )}

                    {index !== false && (
                        <SingleImage
                            key="b"
                            index={index}
                            color={colors[index]}
                            setIndex={setIndex}
                        />
                    )}
                </AnimatePresence>
            </SharedMagicMotion>
        </Container>
    )
}

const Container = styled.div`
    body {
        padding: 0;
        margin: 0;
        background: #fdfdfd;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    * {
        box-sizing: border-box;
    }

    .gallery-container {
        background-color: #eeeeee;
        border-radius: 25px;
        width: 500px;
        height: 500px;
        margin: 0;
        padding: 0 20px 20px 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: space-between;
        list-style: none;
    }

    .gallery-item {
        border-radius: 10px;
        padding: 20px;
        cursor: pointer;
        margin: 20px 0 0 20px;
        flex: 1 1 100px;
    }

    .overlay {
        background: white;
        opacity: 0.2;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }

    .single-image-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
    }

    .single-image-container * {
        pointer-events: all;
    }

    .single-image {
        border-radius: 20px;
        width: 500px;
        height: 300px;
    }
`

const numColors = 4 * 4
const makeColor = hue => `hsl(${hue}, 100%, 50%)`
const colors = Array.from(Array(numColors)).map((_, i) =>
    makeColor(Math.round((360 / numColors) * i))
)

/**
 * TODO:
 * - Pagination
 */
