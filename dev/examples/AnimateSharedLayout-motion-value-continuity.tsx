import * as React from "react"
import { useState } from "react"
import { motion, AnimateSharedLayout } from "@framer"
import styled from "styled-components"

class Underline extends React.Component {
    render() {
        return (
            <motion.div
                layoutId="underline"
                className="underline"
                initial={false}
                animate={{ backgroundColor: this.props.color }}
            />
        )
    }
}

class Item extends React.Component {
    render() {
        const { i, title, selected, color, setSelected } = this.props

        return (
            <motion.li
                key={i}
                id={i}
                layout
                className={`title ${i === selected && "selected"}`}
                animate={{ color: i === selected ? color : "#333" }}
                onClick={() => setSelected(i)}
            >
                {i === selected && <Underline color={color} />}
                {title}
            </motion.li>
        )
    }
}

const Component = () => {
    const [selected, setSelected] = useState(0)

    return (
        <Container>
            <ol>
                {screens.map((screen, i) => (
                    <Item
                        {...screen}
                        i={i}
                        selected={selected}
                        setSelected={setSelected}
                    />
                ))}
            </ol>
        </Container>
    )
}

export const App = () => {
    return (
        <AnimateSharedLayout>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Component />
            </div>
        </AnimateSharedLayout>
    )
}

const Container = styled.div`
    * {
        box-sizing: border-box;
        font-family: Montserrat, sans-serif;
        font-weight: 800;
    }

    ol,
    li {
        list-style: none;
        padding: 0;
        margin: 0;
        user-select: none;
    }

    ol {
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translateZ(0);
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
        position: absolute;
        bottom: -4px;
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
