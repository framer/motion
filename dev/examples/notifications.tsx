import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [notifications, setNotifications] = useState([0])

    return (
        <Container>
            <ul>
                <AnimatePresence initial={false}>
                    {notifications.map(id => (
                        <motion.li
                            key={id}
                            positionTransition
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 0.5,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <CloseButton
                                close={() =>
                                    setNotifications(remove(notifications, id))
                                }
                            />
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
            <button
                className="add"
                onClick={() => setNotifications(add(notifications))}
            >
                +
            </button>
        </Container>
    )
}

const Path = props => (
    <motion.path
        fill="transparent"
        strokeWidth="3"
        stroke="hsl(0, 0%, 18%)"
        strokeLinecap="round"
        {...props}
    />
)

export const CloseButton = ({ close }) => (
    <button onClick={close} className="close">
        <svg width="23" height="23" viewBox="0 0 23 23">
            <Path d="M 3 16.5 L 17 2.5" />
            <Path d="M 3 2.5 L 17 16.346" />
        </svg>
    </button>
)

const Container = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    flex-direction: column;

    ul,
    li {
        padding: 0;
        margin: 0;
    }

    ul {
        position: fixed;
        bottom: 0;
        right: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        list-style: none;
        justify-content: flex-end;
    }

    li {
        width: 300px;
        background: white;
        margin: 10px;
        flex: 0 0 100px;
        position: relative;
        border-radius: 10px;
    }

    button {
        outline: none;
        -webkit-appearance: none;
        cursor: pointer;
    }

    button.add {
        position: fixed;
        bottom: 10px;
        left: 10px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        font-size: 28px;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button.close {
        position: absolute;
        top: 15px;
        right: 10px;
        background: white;
        border: none;
    }
`

const remove = (arr: number[], item: number) => {
    const newArr = [...arr]
    newArr.splice(
        newArr.findIndex(i => i === item),
        1
    )
    return newArr
}

let newIndex = 0
export const add = (arr: number[]) => {
    newIndex++
    return [...arr, newIndex]
}
