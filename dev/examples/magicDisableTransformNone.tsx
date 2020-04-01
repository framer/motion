import React from "react"
import { useState } from "react"
import { motion, MagicMotion } from "@framer"
import styled from "styled-components"

export function App() {
    const [selected, setSelected] = useState(0)

    return (
        <MagicMotion>
            <Container>
                {screens.map(({ title, color }, i) => (
                    <motion.li
                        magic
                        key={i}
                        className={`title ${i === selected && "selected"}`}
                        style={{ color: i === selected ? color : "#333" }}
                        onClick={() => setSelected(i)}
                        allowTransformNone={false}
                    >
                        {i === selected && (
                            <motion.div
                                magicId="underline"
                                className="underline"
                                style={{ backgroundColor: color }}
                                allowTransformNone={false}
                            />
                        )}
                        {title}
                    </motion.li>
                ))}
            </Container>
        </MagicMotion>
    )
}

const Container = styled.ol`
    padding: 0;
    margin: 0;
    background: #fdfdfd;
    min-height: 100vh;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    box-sizing: border-box;
    font-family: Montserrat, sans-serif;
    font-weight: 800;
    list-style: none;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;

    ol,
    li {
        list-style: none;
        padding: 0;
        margin: 0;
        user-select: none;
    }

    .title {
        font-size: 32px;
        margin-left: 20px;
        position: relative;
        cursor: pointer;
    }

    .title.selected {
        font-size: 64px;
    }

    .underline {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: black;
        position: absolute;
        bottom: -4.5px;
    }
`

export const screens = [
    {
        title: "One",
        color: "#ff0055",
    },
    {
        title: "Two",
        color: "#0099ff",
    },
    {
        title: "Threeeee",
        color: "#22cc88",
    },
    {
        title: "Four",
        color: "#ffaa00",
    },
]
