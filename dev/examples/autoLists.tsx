import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * Issues:
 * - Nested stuff
 * - Animating between borderRadius value type
 */

const transition = { duration: 3, ease: "linear" }

interface ListProps {
    list: number[]
    onItemClick: (id: number) => void
    backgroundColor: string
}

const List = ({ list, onItemClick, backgroundColor }: ListProps) => {
    return (
        <motion.ul layoutTransition={transition} style={styles.list}>
            {list.map(id => (
                <motion.li
                    layoutTransition={transition}
                    style={{ ...styles.item, backgroundColor }}
                    key={id}
                    layoutId={id}
                    onClick={() => onItemClick(id)}
                />
            ))}
        </motion.ul>
    )
}

export const App = () => {
    const [listA, setListA] = useState([0, 1, 2, 3, 4, 5, 6])
    const [listB, setListB] = useState([7, 8, 9, 10, 11, 12])
    // const [listA, setListA] = useState([0])
    // const [listB, setListB] = useState([1])

    return (
        <div style={styles.container}>
            <List
                list={listA}
                onItemClick={id =>
                    swapRandomly(id, listA, setListA, listB, setListB)
                }
                backgroundColor="red"
            />
            <List
                list={listB}
                onItemClick={id =>
                    swapRandomly(id, listB, setListB, listA, setListA)
                }
                backgroundColor="blue"
            />
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
    },
    list: {
        width: 350,
        borderRadius: 10,
        padding: 10,
        background: "white",
        display: "flex",
        listStyle: "none",
        flexDirection: "column",
    },
    item: {
        height: 50,
        width: 330,
        borderRadius: 5,
        margin: 10,
    },
}

function swapRandomly(
    id: number,
    listOrigin: number[],
    setListOrigin: (list: number[]) => void,
    listTarget: number[],
    setListTarget: (list: number[]) => void
): void {
    const newOriginList = [...listOrigin]
    const originIndex = newOriginList.indexOf(id)
    newOriginList.splice(originIndex, 1)
    setListOrigin(newOriginList)

    const newTargetList = [...listTarget]
    newTargetList.splice(0, 0, id)
    setListTarget(newTargetList)
}
