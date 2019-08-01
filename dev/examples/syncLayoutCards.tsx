import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"
import { UnstableSyncLayout } from "../../src/components/SyncLayout"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

const container = { boxSizing: "border-box", width: 400, margin: "0 auto" }

const cardContainer = {
    height: 300,
    margin: 50,
}

const card = {
    background: "white",
    cursor: "pointer",
}

const openCard = {
    ...card,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
}

const closedCard = {
    ...card,
    width: "100%",
    height: "100%",
}

const transition = { duration: 3 }

const Card = () => {
    const [isOpen, setOpen] = useState(false)

    return (
        <div style={cardContainer}>
            <motion.div
                layoutTransition={transition}
                style={isOpen ? openCard : closedCard}
                onClick={() => setOpen(!isOpen)}
            />
        </div>
    )
}

export const App = () => {
    return (
        <div style={container}>
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
        </div>
    )
}
