import { motion, AnimatePresence, AnimateSharedLayout } from "@framer"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

/**
 * This demo demonstrates the crossfade function between
 * components with the same layoutId
 *
 * The styles are pretty broken but it makes for a good test
 * case for smooth animation between very different layouts.
 */

function Card({ id, title, category, theme, isSelected, onClick }) {
    return (
        <li className={`card ${theme}`} onClick={onClick}>
            <motion.div className="card-content-container">
                <motion.div
                    className="card-content"
                    layoutId={`card-container-${id}`}
                    magicDependency={isSelected}
                >
                    <motion.div
                        className="card-image-container"
                        layoutId={`card-image-container-${id}`}
                        magicDependency={isSelected}
                    >
                        <img
                            className="card-image"
                            src={`images/${id}.jpg`}
                            alt=""
                        />
                    </motion.div>
                    <motion.div
                        className="title-container"
                        layoutId={`title-container-${id}`}
                        magicDependency={isSelected}
                    >
                        <span className="category">{category}</span>
                        <h2>{title}</h2>
                    </motion.div>
                </motion.div>
            </motion.div>
        </li>
    )
}

function List({ selectedId, setOpen }) {
    return (
        <ul className="card-list">
            {items.map(card => {
                return (
                    <Card
                        key={card.id}
                        {...card}
                        isSelected={card.id === selectedId}
                        onClick={() => setOpen(card.id)}
                    />
                )
            })}
        </ul>
    )
}

export function Item({ id, setOpen }) {
    const { category, title } = items.find(item => item.id === id)

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} //1
                transition={{ duration: 0.2 }}
                className="overlay"
                onClick={() => setOpen(false)}
            />
            <div className="card-content-container open">
                <motion.div
                    className="card-content"
                    layoutId={`card-container-${id}`} //2
                >
                    <motion.div
                        className="card-image-container"
                        layoutId={`card-image-container-${id}`} //3
                    >
                        <img
                            className="card-image"
                            src={`images/${id}.jpg`}
                            alt=""
                        />
                    </motion.div>
                    <motion.div
                        className="title-container"
                        layoutId={`title-container-${id}`} //4
                    >
                        <span className="category">{category}</span>
                        <h2>{title}</h2>
                    </motion.div>
                    <motion.div className="content-container" animate>
                        Text
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}

const Header = () => (
    <header>
        <span className="date">Thursday, August 8th</span>
        <h1>Today</h1>
    </header>
)

export const items = [
    // Photo by ivan Torres on Unsplash
    {
        id: "c",
        category: "Pizza",
        title: "5 Food Apps Delivering the Best of Your City",
        pointOfInterest: 80,
        backgroundColor: "#814A0E",
    },
    // Photo by Dennis Brendel on Unsplash
    {
        id: "f",
        category: "How to",
        title: "Arrange Your Apple Devices for the Gram",
        pointOfInterest: 120,
        backgroundColor: "#959684",
    },
    // Photo by Alessandra Caretto on Unsplash
    {
        id: "a",
        category: "Pedal Power",
        title: "Map Apps for the Superior Mode of Transport",
        pointOfInterest: 260,
        backgroundColor: "#5DBCD2",
    },
    // Photo by Taneli Lahtinen on Unsplash
    {
        id: "g",
        category: "Holidays",
        title: "Our Pick of Apps to Help You Escape From Apps",
        pointOfInterest: 200,
        backgroundColor: "#8F986D",
    },
    // Photo by Simone Hutsch on Unsplash
    {
        id: "d",
        category: "Photography",
        title: "The Latest Ultra-Specific Photography Editing Apps",
        pointOfInterest: 150,
        backgroundColor: "#FA6779",
    },
    // Photo by Siora Photography on Unsplash
    {
        id: "h",
        category: "They're all the same",
        title: "100 Cupcake Apps for the Cupcake Connoisseur",
        pointOfInterest: 60,
        backgroundColor: "#282F49",
    },
    // Photo by Yerlin Matu on Unsplash
    {
        id: "e",
        category: "Cats",
        title: "Yes, They Are Sociopaths",
        pointOfInterest: 200,
        backgroundColor: "#AC7441",
    },
    // Photo by Ali Abdul Rahman on Unsplash
    {
        id: "b",
        category: "Holidays",
        title: "Seriously the Only Escape is the Stratosphere",
        pointOfInterest: 260,
        backgroundColor: "#CC555B",
    },
]

export const openSpring = { type: "spring", stiffness: 200, damping: 30 }
export const closeSpring = { type: "spring", stiffness: 300, damping: 35 }

function Store() {
    const [open, setOpen] = useState<string | false>(false)

    return (
        <AnimateSharedLayout type="crossfade" transition={{ duration: 2 }}>
            <List selectedId={open} setOpen={setOpen} />
            <AnimatePresence>
                {open && <Item id={open} setOpen={setOpen} />}
            </AnimatePresence>
        </AnimateSharedLayout>
    )
}

export function App() {
    return (
        <Container>
            <Header />
            <Store />
        </Container>
    )
}

const Container = styled.div`
    * {
        box-sizing: border-box;
        font-family: ".SFNSText", "SFProText-Regular", "SFUIText-Regular",
            ".SFUIText", Helvetica, Arial, sans-serif;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    margin: 0;
    padding: 0;
    background: black;
    overflow-y: scroll;
    --secondary: rgb(161, 161, 161);
    --divider: #343434;
    font-family: sans-serif;
    text-align: center;
    display: flex;
    justify-content: center;
    width: 100vw;
    max-width: 990px;
    flex: 1 1 100%;
    padding: 45px 25px;

    .screen {
        width: 100%;
        height: 100%;
    }

    h1 {
        font-weight: bold;
        color: white;
        margin: 6px 0 12px;
    }

    .date {
        color: var(--secondary);
        font-size: 14px;
        text-transform: uppercase;
    }

    header {
        border-bottom: 1px solid var(--divider);
        position: relative;
    }

    .avatar {
        background: var(--divider);
        border-radius: 50%;
        position: absolute;
        bottom: 12px;
        right: 0;
        overflow: hidden;
    }

    .avatar,
    .avatar img {
        width: 40px;
        height: 40px;
    }

    ul,
    li {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .card-list {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
    }

    .card {
        position: relative;
        padding: 25px;
        height: 460px;
        flex: 0 0 40%;
        max-width: 40%;
    }

    .card:nth-child(4n + 1),
    .card:nth-child(4n + 4) {
        flex: 0 0 60%;
        max-width: 60%;
    }

    .card:nth-child(odd) {
        padding-left: 0;
    }

    .card:nth-child(even) {
        padding-right: 0;
    }

    .card-content-container {
        width: 100%;
        height: 100%;
        position: relative;
        display: block;
        pointer-events: none;
    }

    .card-content-container.open {
        top: 0;
        left: 0;
        right: 0;
        position: fixed;
        z-index: 1;
        overflow: hidden;
        padding: 40px 0;
    }

    .card-content {
        pointer-events: auto;
        position: relative;
        border-radius: 20px;
        background: #1c1c1e;
        overflow: hidden;
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }

    .open .card-content {
        height: auto;
        max-width: 700px;
        overflow: hidden;
    }

    .card-open-link {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .card-image-container {
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        height: 420px;
        width: 100vw;
    }

    .open .card-image-container,
    .open .title-container {
        z-index: 1;
    }

    .title-container {
        position: absolute;
        top: 15px;
        left: 15px;
        max-width: 300px;
    }

    .open .title-container {
        top: 30px;
        left: 30px;
    }

    h2 {
        color: #fff;
        margin: 8px 0;
    }

    .category {
        color: #fff;
        font-size: 14px;
        text-transform: uppercase;
    }

    .overlay {
        z-index: 1;
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        will-change: opacity;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 990px;
    }

    .overlay a {
        display: block;
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100vw;
        left: 50%;

        transform: translateX(-50%);
    }

    .content-container {
        padding: 460px 35px 35px 35px;
        max-width: 700px;
        width: 90vw;
    }

    p {
        color: #9d9ca1;
        font-size: 20px;
        line-height: 28px;
    }

    @media only screen and (max-width: 800px) {
        .card {
            flex: 0 0 50%;
            max-width: 50%;
        }

        .card:nth-child(4n + 1),
        .card:nth-child(4n + 4) {
            flex: 0 0 50%;
            max-width: 50%;
        }
    }

    @media only screen and (max-width: 600px) {
        .card {
            flex: 1 0 100%;
            max-width: 100%;
            padding-left: 0;
            padding-right: 0;
        }

        .card:nth-child(4n + 1),
        .card:nth-child(4n + 4) {
            flex: 1 0 100%;
            max-width: 100%;
        }

        .card-content-container.open {
            padding: 0;
        }
    }
`
