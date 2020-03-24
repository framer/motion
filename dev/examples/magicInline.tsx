import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import styled from "styled-components"

export function App() {
    const [isExpanded, setIsExpanded] = useState(false)
    return (
        <Wrapper>
            <Column isExpanded={isExpanded}>
                <RowFC color={"red"} borderColor={isExpanded ? "red" : "blue"}>
                    {/* <motion.span magic>Row 1</motion.span> */}
                </RowFC>
                {/* <RowFC
                    color={"blue"}
                    borderColor={!isExpanded ? "red" : "blue"}
                >
                    <motion.span magic>Row 2</motion.span>
                </RowFC>
                <RowFC color={"green"}>
                    <motion.span magic>Row 3</motion.span>
                </RowFC> */}
            </Column>
            <Button onClick={() => setIsExpanded(prev => !prev)}>Click</Button>
        </Wrapper>
    )
}

function RowFC({ color, children, borderColor = "black" }) {
    return (
        <motion.div
            style={{
                fontSize: "20px",
                color,
                border: `10px solid ${borderColor}`,
                borderTopColor: borderColor,
                borderTopLeftRadius: borderColor === "red" ? 10 : 100,
            }}
            magic
            transition={{
                duration: 10,
                linear: true,
            }}
        >
            {children}
        </motion.div>
    )
}

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: papayawhip;
    position: relative;
`

const Column = styled(motion.div)`
    width: 50%;
    height: 90%;
    padding: 2.5%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: ${props =>
        props.isExpanded ? "5fr 1fr 1fr" : "1fr 5fr 1fr"};
    grid-gap: 20px;
    border: 1px solid dodgerblue;

    div {
        border-radius: 8px;
        background: ${props => (props.isExpanded ? "red" : "blue")};
        border: 1px solid pink;
        opacity: ${props => (props.isExpanded ? 1 : 0.5)};
    }

    span {
        display: inline-block;
    }
`

const Button = styled(motion.button)`
    padding: 2% 3%;
    border-radius: 5px;
    font-size: 1rem;
    letter-spacing: 1px;
    position: absolute;
    top: 50%;
    right: 5%;
    transform: translate(-5%, -50%);
    outline: none;
    cursor: pointer;
`
